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
};

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
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

    const [config, customer] = await Promise.all([
      prisma.spinConfig.findUnique({ where: { restaurantId } }),
      prisma.customerProfile.findUnique({
        where: { id: customerId },
        select: { freeSpinsUsedToday: true, lastSpinDate: true, bonusSpins: true },
      }),
    ]);

    if (!config || !config.isActive) {
      return NextResponse.json({ error: "Spin wheel not available" }, { status: 404 });
    }
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const usedToday =
      customer.lastSpinDate && isSameDay(customer.lastSpinDate, new Date())
        ? customer.freeSpinsUsedToday
        : 0;

    return NextResponse.json({
      segments: config.segments as Segment[],
      dailyFreeSpins: config.dailyFreeSpins,
      freeSpinsLeft: Math.max(0, config.dailyFreeSpins - usedToday),
      bonusSpins: customer.bonusSpins,
    });
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

    const { customerId, restaurantId, source } = await req.json();
    if (customerId !== sessionCustomerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!restaurantId || (source !== "FREE" && source !== "BONUS")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const config = await prisma.spinConfig.findUnique({ where: { restaurantId } });
    if (!config || !config.isActive) {
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

    // 2. WEIGHTED RANDOM PICK based on probabilities set by Admin
    let winningIndex = 0;
    
    // Check if all segments have a valid probability
    const hasValidProbabilities = segments.every(s => typeof s.probability === 'number' && s.probability >= 0);
    
    if (hasValidProbabilities) {
      const totalProbability = segments.reduce((sum, s) => sum + (s.probability || 0), 0);
      
      if (totalProbability > 0) {
        // Pick a random number between 0 and totalProbability
        let random = Math.random() * totalProbability;
        
        // Loop through segments and subtract their probability until we hit 0
        for (let i = 0; i < segments.length; i++) {
          random -= (segments[i].probability || 0);
          if (random <= 0) {
            winningIndex = i;
            break;
          }
        }
      } else {
        // Fallback if all probabilities are 0
        winningIndex = Math.floor(Math.random() * segments.length);
      }
    } else {
      // Fallback to uniform random if probabilities are missing
      winningIndex = Math.floor(Math.random() * segments.length);
    }

    const winner = segments[winningIndex];

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