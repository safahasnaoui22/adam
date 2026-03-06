import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // Get restaurant details for logging
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { owner: true }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Log before deletion
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "DELETE_RESTAURANT",
        targetType: "RESTAURANT",
        targetId: restaurantId,
        details: {
          restaurantName: restaurant.name,
          ownerEmail: restaurant.owner.email,
          deletedAt: new Date().toISOString()
        },
      },
    });

    // Delete in correct order due to relations
    await prisma.$transaction([
      // Delete earned rewards
      prisma.earnedReward.deleteMany({
        where: { customer: { restaurantId } },
      }),
      // Delete visits
      prisma.visit.deleteMany({
        where: { customer: { restaurantId } },
      }),
      // Delete customer profiles
      prisma.customerProfile.deleteMany({
        where: { restaurantId },
      }),
      // Delete rewards
      prisma.reward.deleteMany({
        where: { loyaltyProgram: { restaurantId } },
      }),
      // Delete loyalty program
      prisma.loyaltyProgram.deleteMany({
        where: { restaurantId },
      }),
      // Delete subscription
      prisma.subscription.deleteMany({
        where: { restaurantId },
      }),
      // Delete restaurant stats
      prisma.restaurantStats.deleteMany({
        where: { restaurantId },
      }),
      // Finally delete the restaurant
      prisma.restaurant.delete({
        where: { id: restaurantId },
      }),
      // Delete the owner user
      prisma.user.delete({
        where: { id: restaurant.ownerId },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Restaurant and all associated data deleted successfully" 
    });
  } catch (error) {
    console.error("Failed to delete restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}