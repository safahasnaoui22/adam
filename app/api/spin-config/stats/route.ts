// app/api/spin-config/stats/route.ts  — "Voir les stats" for one game
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const restaurantId = session.user.restaurantId;
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing game id" }, { status: 400 });

    const games = await prisma.spinConfig.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    const idx = games.findIndex((g) => g.id === id);
    if (idx === -1) return NextResponse.json({ error: "Game not found" }, { status: 404 });

    // logs from before multi-game support (gameId null) belong to the oldest game
    const where =
      idx === 0
        ? { restaurantId, OR: [{ gameId: id }, { gameId: null }] }
        : { restaurantId, gameId: id };

    const logs = await prisma.spinLog.findMany({
      where,
      select: { customerId: true, prizeLabel: true, pointsAwarded: true, spunAt: true },
      orderBy: { spunAt: "desc" },
    });

    const prizeMap = new Map<string, number>();
    let pointsAwarded = 0;
    for (const l of logs) {
      pointsAwarded += l.pointsAwarded;
      prizeMap.set(l.prizeLabel, (prizeMap.get(l.prizeLabel) ?? 0) + 1);
    }
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

    return NextResponse.json({
      totalSpins: logs.length,
      spinsLast7Days: logs.filter((l) => l.spunAt.getTime() >= weekAgo).length,
      uniquePlayers: new Set(logs.map((l) => l.customerId)).size,
      pointsAwarded,
      prizes: Array.from(prizeMap, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error("Failed to load spin stats:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}