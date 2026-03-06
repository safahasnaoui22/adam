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

    // Get current date for comparisons
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalRestaurants,
      activeRestaurants,
      pendingRestaurants,
      suspendedRestaurants,
      totalCustomers,
      totalAdmins,
      monthlyNewRestaurants,
      monthlyNewCustomers,
      revenueStats
    ] = await Promise.all([
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { accountStatus: "ACTIVE" } }),
      prisma.restaurant.count({ where: { accountStatus: "PENDING" } }),
      prisma.restaurant.count({ where: { accountStatus: "SUSPENDED" } }),
      prisma.customerProfile.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      
      // New restaurants this month
      prisma.restaurant.count({
        where: { createdAt: { gte: firstDayOfMonth } }
      }),
      
      // New customers this month
      prisma.customerProfile.count({
        where: { createdAt: { gte: firstDayOfMonth } }
      }),
      
      // Aggregate revenue from all restaurants
      prisma.restaurantStats.aggregate({
        _sum: { totalRevenue: true }
      })
    ]);

    // Get growth percentages
    const lastMonthNewRestaurants = await prisma.restaurant.count({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfMonth
        }
      }
    });

    const restaurantGrowth = lastMonthNewRestaurants > 0
      ? ((monthlyNewRestaurants - lastMonthNewRestaurants) / lastMonthNewRestaurants) * 100
      : monthlyNewRestaurants > 0 ? 100 : 0;

    return NextResponse.json({
      overview: {
        totalRestaurants,
        activeRestaurants,
        pendingRestaurants,
        suspendedRestaurants,
        totalCustomers,
        totalAdmins,
      },
      growth: {
        monthlyNewRestaurants,
        restaurantGrowth: Math.round(restaurantGrowth * 10) / 10,
        monthlyNewCustomers,
      },
      revenue: {
        total: revenueStats._sum.totalRevenue || 0,
      }
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}