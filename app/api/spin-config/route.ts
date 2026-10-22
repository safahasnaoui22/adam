// app/api/spin-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// 1. Updated Type to include probability
type Segment = { 
  label: string; 
  points: number; 
  color: string; 
  textColor: string; 
  probability: number; 
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
          // Default new Stampi fields
          name: "Ma Roue Principale",
          rule: "purchase",
          firstFree: true,
          conditions: { installApp: false, notifications: false, phone: true },
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
    
    // 2. Destructure all the new Stampi fields from the request body
    const { 
      isActive, 
      dailyFreeSpins, 
      bonusSpinsPerVisit, 
      segments,
      name,
      startDate,
      endDate,
      rule,
      customRules,
      firstFree,
      conditions
    } = body as {
      isActive?: boolean;
      dailyFreeSpins?: number;
      bonusSpinsPerVisit?: number;
      segments?: Segment[];
      name?: string;
      startDate?: string;
      endDate?: string;
      rule?: string;
      customRules?: string;
      firstFree?: boolean;
      conditions?: any;
    };

    // 3. Validate segments and probabilities
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
        if (typeof s.probability !== "number" || s.probability < 0) {
          return NextResponse.json({ error: "La probabilité doit être un nombre positif" }, { status: 400 });
        }
      }
    }
    
    if (dailyFreeSpins !== undefined && dailyFreeSpins < 0) {
      return NextResponse.json({ error: "Le nombre de tours gratuits doit être positif" }, { status: 400 });
    }
    if (bonusSpinsPerVisit !== undefined && bonusSpinsPerVisit < 0) {
      return NextResponse.json({ error: "Le nombre de tours bonus doit être positif" }, { status: 400 });
    }

    // 4. Prepare the data for Prisma (parse dates if they exist)
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
    
    // Convert empty strings to null for dates, otherwise parse them
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    const createData: any = {
      restaurantId: session.user.restaurantId,
      isActive: isActive ?? true,
      dailyFreeSpins: dailyFreeSpins ?? 3,
      bonusSpinsPerVisit: bonusSpinsPerVisit ?? 1,
      segments: segments ?? DEFAULT_SEGMENTS,
      name: name ?? "Nouveau jeu",
      rule: rule ?? "purchase",
      firstFree: firstFree ?? true,
      conditions: conditions ?? { installApp: false, notifications: false, phone: true },
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      customRules: customRules ?? null,
    };

    // 5. Upsert the config with the new fields
    const config = await prisma.spinConfig.upsert({
      where: { restaurantId: session.user.restaurantId },
      create: createData,
      update: updateData,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to update spin config:", error);
    return NextResponse.json({ error: "Failed to update spin config" }, { status: 500 });
  }
}