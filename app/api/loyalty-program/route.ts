// app/api/loyalty-program/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let loyaltyProgram = await prisma.loyaltyProgram.findUnique({
      where: { restaurantId: session.user.restaurantId },
      include: { rewards: { orderBy: { pointsRequired: 'asc' } } },
    });

    // Create default program if it doesn't exist
    if (!loyaltyProgram) {
      loyaltyProgram = await prisma.loyaltyProgram.create({
        data: {
          restaurantId: session.user.restaurantId,
          spendThreshold: 1,
          pointsEarned: 10,
        },
        include: { rewards: true },
      });
    }

    return NextResponse.json(loyaltyProgram);
  } catch (error) {
    console.error("Failed to fetch loyalty program:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty program" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { spendThreshold, pointsEarned } = body;

    const updated = await prisma.loyaltyProgram.upsert({
      where: { restaurantId: session.user.restaurantId },
      update: { spendThreshold, pointsEarned },
      create: {
        restaurantId: session.user.restaurantId,
        spendThreshold: spendThreshold ?? 1,
        pointsEarned: pointsEarned ?? 10,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update loyalty program:", error);
    return NextResponse.json(
      { error: "Failed to update loyalty program" },
      { status: 500 }
    );
  }
}