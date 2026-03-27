// app/api/rewards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, pointsRequired, description, isActive } = await request.json();

    // Get loyalty program id
    let loyaltyProgram = await prisma.loyaltyProgram.findUnique({
      where: { restaurantId: session.user.restaurantId },
    });

    if (!loyaltyProgram) {
      // Create default program if missing
      loyaltyProgram = await prisma.loyaltyProgram.create({
        data: {
          restaurantId: session.user.restaurantId,
          spendThreshold: 1,
          pointsEarned: 10,
        },
      });
    }

    const reward = await prisma.reward.create({
      data: {
        name,
        pointsRequired,
        description,
        isActive: isActive ?? true,
        loyaltyProgramId: loyaltyProgram.id,
      },
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error("Failed to create reward:", error);
    return NextResponse.json(
      { error: "Failed to create reward" },
      { status: 500 }
    );
  }
}