// app/api/customer/spin/route.ts
//
// Two spin sources, both enforced server-side (never trust the client for
// eligibility or the prize — the old version of this feature let the
// browser pick the winner and just report it, which meant anyone could
// send { points: 999999 } from devtools):
//
//   FREE  — up to SpinConfig.dailyFreeSpins per calendar day, reset by
//           comparing CustomerProfile.lastSpinDate to today.
//   BONUS — spent from CustomerProfile.bonusSpins, which accrues by
//           SpinConfig.bonusSpinsPerVisit each time add-points records a
//           new Visit (i.e. a purchase/scan).
//
// GET returns the wheel's segments + how many spins of each kind are left,
// so the frontend can draw the wheel and disable the button correctly.
// POST performs one spin: validates eligibility, picks the winner, credits
// points, logs it, and returns the winning index for the wheel to animate to.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// 1. Added probability to the Segment type
type Segment = { 
  label: string; 
  points: number; 
  color: string; 
  textColor: string;
  probability?: number;
  stock?: number | null;
};

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

// A game is playable only if it is switched on AND inside its optional schedule
function isPlayable(g: { isActive: boolean; startDate: Date | null; endDate: Date | null }, now = new Date()) {
  if (!g.isActive) return false;
  if (g.startDate && now < g.startDate) return false;
  if (g.endDate) {
    const end = new Date(g.endDate);
    end.setHours(23, 59, 59, 999);
    if (now > end) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const customerId = session?.user?.customerProfile?.id;
    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }

    const [configs, customer] = await Promise.all([
      prisma.spinConfig.findMany({ where: { restaurantId }, orderBy: { createdAt: "asc" } }),
      prisma.customerProfile.findUnique({
        where: { id: customerId },
        select: { freeSpinsUsedToday: true, lastSpinDate: true, bonusSpins: true },
      }),
    ]);

    // Deactivated (or out-of-schedule) games disappear from the customer wheel
    const activeGames = configs.filter((c) => isPlayable(c));
    if (activeGames.length === 0) {
      return NextResponse.json({ error: "Spin wheel not available" }, { status: 404 });
    }
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const usedToday =
      customer.lastSpinDate && isSameDay(customer.lastSpinDate, new Date())
        ? customer.freeSpinsUsedToday
        : 0;

    const games = activeGames.map((g) => ({
      id: g.id,
      name: g.name,
      segments: g.segments as Segment[],
      dailyFreeSpins: g.dailyFreeSpins,
      freeSpinsLeft: Math.max(0, g.dailyFreeSpins - usedToday),
    }));

    return NextResponse.json({ games, bonusSpins: customer.bonusSpins });
  } catch (error) {
    console.error("Failed to load spin status:", error);
    return NextResponse.json({ error: "Failed to load spin wheel" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionCustomerId = session?.user?.customerProfile?.id;
    if (!sessionCustomerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, restaurantId, source, gameId } = await req.json();
    if (customerId !== sessionCustomerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!restaurantId || (source !== "FREE" && source !== "BONUS")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const allConfigs = await prisma.spinConfig.findMany({ where: { restaurantId }, orderBy: { createdAt: "asc" } });
    const playable = allConfigs.filter((c) => isPlayable(c));
    const config = (gameId ? playable.find((c) => c.id === gameId) : undefined) ?? playable[0];
    if (!config) {
      return NextResponse.json({ error: "Spin wheel not available" }, { status: 404 });
    }
    
    const segments = config.segments as Segment[];
    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: "Wheel has no segments configured" }, { status: 500 });
    }

    const customer = await prisma.customerProfile.findFirst({
      where: { id: customerId, restaurantId },
      select: { freeSpinsUsedToday: true, lastSpinDate: true, bonusSpins: true, points: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const today = new Date();
    const usedToday =
      customer.lastSpinDate && isSameDay(customer.lastSpinDate, today)
        ? customer.freeSpinsUsedToday
        : 0;

    if (source === "FREE" && usedToday >= config.dailyFreeSpins) {
      return NextResponse.json({ error: "No free spins left today" }, { status: 400 });
    }
    if (source === "BONUS" && customer.bonusSpins <= 0) {
      return NextResponse.json({ error: "No bonus spins available" }, { status: 400 });
    }

    // 2. WEIGHTED RANDOM PICK based on probabilities set by Admin.
    //    Segments whose stock is used up (stock === 0) can no longer be won.
    const eligible = segments
      .map((seg, index) => ({ seg, index }))
      .filter(({ seg }) => seg.stock === undefined || seg.stock === null || seg.stock > 0);
    if (eligible.length === 0) {
      return NextResponse.json({ error: "Aucun lot disponible" }, { status: 409 });
    }

    let winningIndex = eligible[0].index;
    const totalProbability = eligible.reduce((sum, { seg }) => sum + (seg.probability ?? 0), 0);
    if (totalProbability > 0) {
      let random = Math.random() * totalProbability;
      for (const { seg, index } of eligible) {
        random -= seg.probability ?? 0;
        if (random <= 0) { winningIndex = index; break; }
      }
    } else {
      winningIndex = eligible[Math.floor(Math.random() * eligible.length)].index;
    }

    const winner = segments[winningIndex];

    // Consume one unit of stock (optimistic lock on updatedAt so two players can't win the last one)
    if (typeof winner.stock === "number") {
      const newSegments = segments.map((seg, i) => (i === winningIndex ? { ...seg, stock: (seg.stock as number) - 1 } : seg));
      const locked = await prisma.spinConfig.updateMany({
        where: { id: config.id, updatedAt: config.updatedAt },
        data: { segments: newSegments as any },
      });
      if (locked.count === 0) {
        return NextResponse.json({ error: "Veuillez réessayer" }, { status: 409 });
      }
    }

    const [updatedCustomer] = await prisma.$transaction([
      prisma.customerProfile.update({
        where: { id: customerId },
        data: {
          points: { increment: winner.points },
          lastSpinDate: today,
          freeSpinsUsedToday: source === "FREE" ? usedToday + 1 : usedToday,
          bonusSpins: source === "BONUS" ? { decrement: 1 } : undefined,
        },
      }),
      prisma.spinLog.create({
        data: {
          customerId,
          restaurantId,
          gameId: config.id,
          source,
          segmentIndex: winningIndex,
          prizeLabel: winner.label,
          pointsAwarded: winner.points,
        },
      }),
    ]);

    const usedTodayAfter = source === "FREE" ? usedToday + 1 : usedToday;

    return NextResponse.json({
      success: true,
      winningIndex,
      prize: winner,
      newPoints: updatedCustomer.points,
      freeSpinsLeft: Math.max(0, config.dailyFreeSpins - usedTodayAfter),
      bonusSpins: updatedCustomer.bonusSpins,
    });
  } catch (error) {
    console.error("Failed to process spin:", error);
    return NextResponse.json({ error: "Failed to process spin" }, { status: 500 });
  }
}