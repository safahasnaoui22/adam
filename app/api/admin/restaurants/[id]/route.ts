// app/api/admin/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { AccountStatus, SubscriptionPlan } from "@prisma/client";

// GET - Fetch a single restaurant with details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
        subscription: true, // Include subscription to get plan
        stats: true,
        loyaltyProgram: {
          include: {
            rewards: true,
          },
        },
        _count: {
          select: {
            customers: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const recentCustomers = await prisma.customerProfile.findMany({
      where: { restaurantId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    // Transform to include plan from subscription
    return NextResponse.json({
      ...restaurant,
      plan: restaurant.subscription?.plan || "FREE",
      recentCustomers,
    });
  } catch (error) {
    console.error("Failed to fetch restaurant details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update restaurant status or subscription plan
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, plan } = body;
    
    const updateData: any = {};

    // Update account status if provided
    if (status) {
      updateData.accountStatus = status;
      
      // Add timestamps based on status changes
      if (status === "ACTIVE") {
        updateData.activatedAt = new Date();
        updateData.suspendedAt = null;
        updateData.suspendedReason = null;
      } else if (status === "SUSPENDED") {
        updateData.suspendedAt = new Date();
      }
    }

    // First update the restaurant status if needed
    let updatedRestaurant;
    if (Object.keys(updateData).length > 0) {
      updatedRestaurant = await prisma.restaurant.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          accountStatus: true,
          name: true,
          email: true,
        },
      });
    }

    // Update subscription plan if provided
    let updatedSubscription;
    if (plan) {
      updatedSubscription = await prisma.subscription.upsert({
        where: { restaurantId: id },
        update: { plan: plan as SubscriptionPlan },
        create: {
          restaurantId: id,
          plan: plan as SubscriptionPlan,
          startDate: new Date(),
          autoRenew: true,
        },
        select: {
          plan: true,
          startDate: true,
        },
      });
    }

    // Return combined response
    return NextResponse.json({
      id,
      accountStatus: updatedRestaurant?.accountStatus || (await prisma.restaurant.findUnique({ where: { id }, select: { accountStatus: true } }))?.accountStatus,
      plan: updatedSubscription?.plan || (await prisma.subscription.findUnique({ where: { restaurantId: id }, select: { plan: true } }))?.plan,
      name: updatedRestaurant?.name,
      email: updatedRestaurant?.email,
    });
  } catch (error) {
    console.error("Failed to update restaurant:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a restaurant and all related data
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existing = await prisma.restaurant.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Restaurant introuvable (déjà supprimé ?)" },
        { status: 404 }
      );
    }

    // Delete restaurant and ALL related data in one transaction.
    // Every table that points to the restaurant or to its customers must be
    // emptied first, otherwise PostgreSQL rejects the delete (foreign keys).
    await prisma.$transaction(
      async (tx) => {
        const customers = await tx.customerProfile.findMany({
          where: { restaurantId: id },
          select: { id: true, userId: true },
        });
        const customerIds = customers.map((c) => c.id);
        const customerUserIds = customers.map((c) => c.userId);

        if (customerIds.length > 0) {
          await tx.visit.deleteMany({ where: { customerId: { in: customerIds } } });
          await tx.earnedReward.deleteMany({ where: { customerId: { in: customerIds } } });
          await tx.spinLog.deleteMany({ where: { customerId: { in: customerIds } } });
          await tx.bonusRequest.deleteMany({ where: { customerId: { in: customerIds } } });
          // push subscriptions are ON DELETE CASCADE, but be explicit
          await tx.pushSubscription.deleteMany({ where: { clientId: { in: customerIds } } });
        }

        // Anything still attached to the restaurant itself
        await tx.bonusRequest.deleteMany({ where: { restaurantId: id } });
        await tx.spinLog.deleteMany({ where: { restaurantId: id } });
        await tx.spinConfig.deleteMany({ where: { restaurantId: id } });

        await tx.customerProfile.deleteMany({ where: { restaurantId: id } });

        const loyaltyProgram = await tx.loyaltyProgram.findFirst({
          where: { restaurantId: id },
          select: { id: true },
        });
        if (loyaltyProgram) {
          await tx.reward.deleteMany({ where: { loyaltyProgramId: loyaltyProgram.id } });
          await tx.loyaltyProgram.delete({ where: { id: loyaltyProgram.id } });
        }

        await tx.subscription.deleteMany({ where: { restaurantId: id } });
        await tx.restaurantStats.deleteMany({ where: { restaurantId: id } });
        await tx.adminLog.deleteMany({
          where: { targetType: "RESTAURANT", targetId: id },
        });

        await tx.restaurant.delete({ where: { id } });

        // Remove the login accounts too (owner + the customers' accounts),
        // otherwise the owner could still sign in and land on a dashboard with
        // no restaurant ("Restaurant not found"), and their email stays locked.
        const userIds = [existing.ownerId, ...customerUserIds];
        await tx.activityLog.deleteMany({ where: { userId: { in: userIds } } });
        await tx.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
        await tx.user.deleteMany({ where: { id: { in: userIds } } });
      },
      // large restaurants can have thousands of rows: the default 5s is too short
      { maxWait: 10000, timeout: 60000 }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete restaurant:", error);
    // Prisma error code (e.g. P2003 = foreign key) helps to diagnose quickly
    const code = error?.code ? ` (${error.code})` : "";
    return NextResponse.json(
      { error: `Failed to delete restaurant${code}` },
      { status: 500 }
    );
  }
}
