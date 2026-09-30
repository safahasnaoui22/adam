// app/api/spin-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

type Segment = { label: string; points: number; color: string; textColor: string };

const DEFAULT_SEGMENTS: Segment[] = [
  { label: "10 pts",       points: 10,  color: "#fe5502", textColor: "#ffffff" },
  { label: "Réessayer",    points: 0,   color: "#382f45", textColor: "#ffffff" },
  { label: "25 pts",       points: 25,  color: "#ff8c42", textColor: "#ffffff" },
  { label: "5 pts",        points: 5,   color: "#4f3f60", textColor: "#ffffff" },
  { label: "50 pts",       points: 50,  color: "#fe5502", textColor: "#ffffff" },
  { label: "Réessayer",    points: 0,   color: "#382f45", textColor: "#ffffff" },
  { label: "15 pts",       points: 15,  color: "#ff8c42", textColor: "#ffffff" },
  { label: "100 pts",      points: 100, color: "#4f3f60", textColor: "#ffffff" },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let config = await prisma.spinConfig.findUnique({
      where: { restaurantId: session.user.restaurantId },
    });

    if (!config) {
      config = await prisma.spinConfig.create({
        data: {
          restaurantId: session.user.restaurantId,
          isActive: true,
          dailyFreeSpins: 3,
          bonusSpinsPerVisit: 1,
          segments: DEFAULT_SEGMENTS,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to fetch spin config:", error);
    return NextResponse.json({ error: "Failed to fetch spin config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, dailyFreeSpins, bonusSpinsPerVisit, segments } = body as {
      isActive?: boolean;
      dailyFreeSpins?: number;
      bonusSpinsPerVisit?: number;
      segments?: Segment[];
    };

    if (segments) {
      if (!Array.isArray(segments) || segments.length < 2) {
        return NextResponse.json(
          { error: "La roue doit avoir au moins 2 segments" },
          { status: 400 }
        );
      }
      for (const s of segments) {
        if (typeof s.label !== "string" || !s.label.trim()) {
          return NextResponse.json({ error: "Chaque segment doit avoir un libellé" }, { status: 400 });
        }
        if (typeof s.points !== "number" || s.points < 0) {
          return NextResponse.json({ error: "Les points doivent être un nombre positif" }, { status: 400 });
        }
      }
    }
    if (dailyFreeSpins !== undefined && dailyFreeSpins < 0) {
      return NextResponse.json({ error: "Le nombre de tours gratuits doit être positif" }, { status: 400 });
    }
    if (bonusSpinsPerVisit !== undefined && bonusSpinsPerVisit < 0) {
      return NextResponse.json({ error: "Le nombre de tours bonus doit être positif" }, { status: 400 });
    }

    const config = await prisma.spinConfig.upsert({
      where: { restaurantId: session.user.restaurantId },
      create: {
        restaurantId: session.user.restaurantId,
        isActive: isActive ?? true,
        dailyFreeSpins: dailyFreeSpins ?? 3,
        bonusSpinsPerVisit: bonusSpinsPerVisit ?? 1,
        segments: segments ?? DEFAULT_SEGMENTS,
      },
      update: {
        ...(isActive !== undefined && { isActive }),
        ...(dailyFreeSpins !== undefined && { dailyFreeSpins }),
        ...(bonusSpinsPerVisit !== undefined && { bonusSpinsPerVisit }),
        ...(segments !== undefined && { segments }),
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to update spin config:", error);
    return NextResponse.json({ error: "Failed to update spin config" }, { status: 500 });
  }
}