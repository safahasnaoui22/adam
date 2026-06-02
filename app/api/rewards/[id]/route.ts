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

    // Find reward and check if it has been earned by any customer
    const reward = await prisma.reward.findFirst({
      where: {
        id,
        loyaltyProgram: {
          restaurantId: session.user.restaurantId,
        },
      },
      include: {
        earnedRewards: true,
      },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Récompense non trouvée" },
        { status: 404 }
      );
    }

    if (reward.earnedRewards.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cette récompense a déjà été gagnée par des clients et ne peut pas être supprimée.",
        },
        { status: 409 }
      );
    }

    await prisma.reward.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Récompense supprimée" });
  } catch (error) {
    console.error("Failed to delete reward:", error);
    if (error instanceof Error && error.message.includes("Foreign key constraint")) {
      return NextResponse.json(
        { error: "Cette récompense ne peut pas être supprimée car elle est liée à des historiques clients." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Échec de la suppression de la récompense" },
      { status: 500 }
    );
  }
}