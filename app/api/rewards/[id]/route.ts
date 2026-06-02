import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, pointsRequired, description, isActive } = await request.json();

    const reward = await prisma.reward.update({
      where: { id },
      data: { name, pointsRequired, description, isActive },
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error("Failed to update reward:", error);
    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 }
    );
  }
}

// app/api/rewards/[id]/route.ts – DELETE only (keep PUT as is)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Find reward with earned rewards count
    const reward = await prisma.reward.findFirst({
      where: {
        id,
        loyaltyProgram: {
          restaurantId: session.user.restaurantId,
        },
      },
      include: {
        _count: {
          select: { earnedRewards: true },
        },
      },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Récompense non trouvée" },
        { status: 404 }
      );
    }

    // 2. If any customer earned this reward, block deletion
    if (reward._count.earnedRewards > 0) {
      console.log(
        `[DELETE BLOCKED] Reward ${id} has ${reward._count.earnedRewards} earned record(s).`
      );
      return NextResponse.json(
        {
          error:
            "Cette récompense a déjà été gagnée par des clients et ne peut pas être supprimée.",
        },
        { status: 409 }
      );
    }

    // 3. Safe to delete
    await prisma.reward.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Récompense supprimée" });
  } catch (error) {
    console.error("Failed to delete reward:", error);
    return NextResponse.json(
      { error: "Échec de la suppression de la récompense" },
      { status: 500 }
    );
  }
}