// app/api/spin-config/route.ts
// A restaurant can now have MANY wheel games. Each one can be activated /
// deactivated independently (isActive).
//   GET    -> list of games
//   POST   -> create a new game (added beside the existing ones)
//   PUT    -> update a game (body must contain `id`) — also used for the on/off toggle
//   DELETE -> /api/spin-config?id=xxx
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

type Segment = {
  label: string;
  points: number;
  color: string;
  textColor: string;
  probability: number;
  stock?: number | null; // optional prize stock (null / undefined = unlimited)
  type?: "none" | "points" | "gift" | "coupon" | "free_spin";
  description?: string;
};

const DEFAULT_SEGMENTS: Segment[] = [
  { label: "10 pts",       points: 10,  probability: 12.5, color: "#fe5502", textColor: "#ffffff" },
  { label: "Réessayer",    points: 0,   probability: 12.5, color: "#382f45", textColor: "#ffffff" },
  { label: "25 pts",       points: 25,  probability: 12.5, color: "#ff8c42", textColor: "#ffffff" },
  { label: "5 pts",        points: 5,   probability: 12.5, color: "#4f3f60", textColor: "#ffffff" },
  { label: "50 pts",       points: 50,  probability: 12.5, color: "#fe5502", textColor: "#ffffff" },
  { label: "Réessayer",    points: 0,   probability: 12.5, color: "#382f45", textColor: "#ffffff" },
  { label: "15 pts",       points: 15,  probability: 12.5, color: "#ff8c42", textColor: "#ffffff" },
  { label: "100 pts",      points: 100, probability: 12.5, color: "#4f3f60", textColor: "#ffffff" },
];

function validateSegments(segments: unknown): string | null {
  if (!Array.isArray(segments) || segments.length < 2) return "La roue doit avoir au moins 2 segments";
  for (const s of segments as Segment[]) {
    if (typeof s.label !== "string" || !s.label.trim()) return "Chaque segment doit avoir un libellé";
    if (typeof s.points !== "number" || s.points < 0) return "Les points doivent être un nombre positif";
    if (typeof s.probability !== "number" || s.probability < 0) return "La probabilité doit être un nombre positif";
    if (s.type !== undefined && !["none", "points", "gift", "coupon", "free_spin"].includes(s.type)) return "Type de prix invalide";
    if (s.stock !== undefined && s.stock !== null && (typeof s.stock !== "number" || s.stock < 0)) return "Le stock doit être un nombre positif";
  }
  return null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const restaurantId = session.user.restaurantId;

    let games = await prisma.spinConfig.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "asc" },
    });

    // First visit: create the default wheel so there is always one "old" game
    if (games.length === 0) {
      const created = await prisma.spinConfig.create({
        data: {
          restaurantId,
          isActive: true,
          dailyFreeSpins: 3,
          bonusSpinsPerVisit: 1,
          segments: DEFAULT_SEGMENTS,
          name: "Ma Roue Principale",
          rule: "purchase",
          firstFree: true,
          conditions: { installApp: false, notifications: false, phone: true },
        },
      });
      games = [created];
    }

    // number of spins played per game ("1 tours" on the card). Old logs without gameId belong to the oldest game.
    const grouped = await prisma.spinLog.groupBy({
      by: ["gameId"],
      where: { restaurantId },
      _count: { _all: true },
    });
    const countFor = (gid: string | null) => grouped.find((g) => g.gameId === gid)?._count._all ?? 0;
    const withCounts = games.map((g, i) => ({
      ...g,
      spinCount: countFor(g.id) + (i === 0 ? countFor(null) : 0),
    }));

    return NextResponse.json(withCounts);
  } catch (error) {
    console.error("Failed to fetch spin config:", error);
    return NextResponse.json({ error: "Failed to fetch spin config" }, { status: 500 });
  }
}

// Create a NEW game (does not touch the existing ones)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      isActive, dailyFreeSpins, bonusSpinsPerVisit, segments,
      name, startDate, endDate, rule, customRules, firstFree, conditions,
    } = body;

    const segError = validateSegments(segments);
    if (segError) return NextResponse.json({ error: segError }, { status: 400 });
    if (dailyFreeSpins !== undefined && dailyFreeSpins < 0) {
      return NextResponse.json({ error: "Le nombre de tours gratuits doit être positif" }, { status: 400 });
    }
    if (bonusSpinsPerVisit !== undefined && bonusSpinsPerVisit < 0) {
      return NextResponse.json({ error: "Le nombre de tours bonus doit être positif" }, { status: 400 });
    }

    // Only ONE game can be active at a time: a new active game switches the others off
    if (isActive ?? true) {
      await prisma.spinConfig.updateMany({ where: { restaurantId: session.user.restaurantId, isActive: true }, data: { isActive: false } });
    }

    const game = await prisma.spinConfig.create({
      data: {
        restaurantId: session.user.restaurantId,
        isActive: isActive ?? true,
        dailyFreeSpins: dailyFreeSpins ?? 3,
        bonusSpinsPerVisit: bonusSpinsPerVisit ?? 1,
        segments,
        name: (name && String(name).trim()) || "Nouveau jeu",
        rule: rule ?? "purchase",
        firstFree: firstFree ?? true,
        conditions: conditions ?? { installApp: false, notifications: false, phone: true },
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        customRules: customRules ?? null,
      },
    });
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Failed to create spin game:", error);
    return NextResponse.json({ error: "Failed to create spin game" }, { status: 500 });
  }
}

// Update one game (also used by the Active / Inactive switch)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      id, isActive, dailyFreeSpins, bonusSpinsPerVisit, segments,
      name, startDate, endDate, rule, customRules, firstFree, conditions,
    } = body;

    if (!id) return NextResponse.json({ error: "Missing game id" }, { status: 400 });

    const existing = await prisma.spinConfig.findFirst({
      where: { id, restaurantId: session.user.restaurantId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Game not found" }, { status: 404 });

    if (segments !== undefined) {
      const segError = validateSegments(segments);
      if (segError) return NextResponse.json({ error: segError }, { status: 400 });
    }
    if (dailyFreeSpins !== undefined && dailyFreeSpins < 0) {
      return NextResponse.json({ error: "Le nombre de tours gratuits doit être positif" }, { status: 400 });
    }
    if (bonusSpinsPerVisit !== undefined && bonusSpinsPerVisit < 0) {
      return NextResponse.json({ error: "Le nombre de tours bonus doit être positif" }, { status: 400 });
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (dailyFreeSpins !== undefined) updateData.dailyFreeSpins = dailyFreeSpins;
    if (bonusSpinsPerVisit !== undefined) updateData.bonusSpinsPerVisit = bonusSpinsPerVisit;
    if (segments !== undefined) updateData.segments = segments;
    if (name !== undefined) updateData.name = name;
    if (rule !== undefined) updateData.rule = rule;
    if (customRules !== undefined) updateData.customRules = customRules;
    if (firstFree !== undefined) updateData.firstFree = firstFree;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    // Only ONE game can be active at a time: activating this one switches the others off
    if (isActive === true) {
      await prisma.spinConfig.updateMany({
        where: { restaurantId: session.user.restaurantId, isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }

    const game = await prisma.spinConfig.update({ where: { id }, data: updateData });
    return NextResponse.json(game);
  } catch (error) {
    console.error("Failed to update spin config:", error);
    return NextResponse.json({ error: "Failed to update spin config" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing game id" }, { status: 400 });

    const result = await prisma.spinConfig.deleteMany({
      where: { id, restaurantId: session.user.restaurantId },
    });
    if (result.count === 0) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete spin game:", error);
    return NextResponse.json({ error: "Failed to delete spin game" }, { status: 500 });
  }
}