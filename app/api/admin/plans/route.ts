import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all restaurants with their subscription info
    const restaurants = await prisma.restaurant.findMany({
      include: {
        subscription: true,
        _count: {
          select: { customers: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group by plan type
    const planStats = {
      FREE: restaurants.filter(r => r.subscription?.plan === "FREE").length,
      BASIC: restaurants.filter(r => r.subscription?.plan === "BASIC").length,
      PREMIUM: restaurants.filter(r => r.subscription?.plan === "PREMIUM").length,
      ENTERPRISE: restaurants.filter(r => r.subscription?.plan === "ENTERPRISE").length,
    };

    return NextResponse.json({
      restaurants: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        plan: r.subscription?.plan || "FREE",
        startDate: r.subscription?.startDate,
        endDate: r.subscription?.endDate,
        autoRenew: r.subscription?.autoRenew,
        customerCount: r._count.customers,
      })),
      stats: planStats
    });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, plan, startDate, endDate, autoRenew } = body;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { subscription: true }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    let subscription;

    if (restaurant.subscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { restaurantId },
        data: {
          plan,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : null,
          autoRenew,
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          restaurantId,
          plan,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          autoRenew: autoRenew ?? true,
        },
      });
    }

    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_PLAN",
        targetType: "RESTAURANT",
        targetId: restaurantId,
        details: { newPlan: plan },
      },
    });

    return NextResponse.json({ 
      success: true, 
      subscription 
    });
  } catch (error) {
    console.error("Failed to update plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}