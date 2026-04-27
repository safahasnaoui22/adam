import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { startOfDay, subDays, eachDayOfInterval, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      // Return empty stats instead of error – the page will still show charts with zeros
      return NextResponse.json({
        customerGrowth: [],
        pointsPerDay: [],
        rewardsPerDay: [],
        totalCustomers: 0,
        totalPoints: 0,
        totalVisits: 0,
        totalRewardsRedeemed: 0,
      });
    }

    const restaurantId = session.user.restaurantId;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      // Restaurant not found – return empty stats (page will still work)
      return NextResponse.json({
        customerGrowth: [],
        pointsPerDay: [],
        rewardsPerDay: [],
        totalCustomers: 0,
        totalPoints: 0,
        totalVisits: 0,
        totalRewardsRedeemed: 0,
      });
    }

    // Fetch data (all safe, uses empty arrays if no data)
    const [customers, visits, redeemedRewards] = await Promise.all([
      prisma.customerProfile.findMany({
        where: { restaurantId },
        select: { createdAt: true, points: true },
      }),
      prisma.visit.findMany({
        where: { customer: { restaurantId } },
        select: { date: true, pointsEarned: true },
        orderBy: { date: "asc" },
      }),
      prisma.earnedReward.findMany({
        where: { customer: { restaurantId } },
        select: { earnedAt: true },
        orderBy: { earnedAt: "asc" },
      }),
    ]);

    // Generate last 30 days
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    const customerGrowth = dateRange.map(day => {
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
      const count = customers.filter(c => new Date(c.createdAt) <= endOfDay).length;
      return { date: format(day, "dd/MM"), count };
    });

    const pointsPerDay = dateRange.map(day => {
      const start = startOfDay(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const totalPoints = visits
        .filter(v => new Date(v.date) >= start && new Date(v.date) <= end)
        .reduce((sum, v) => sum + v.pointsEarned, 0);
      return { date: format(day, "dd/MM"), points: totalPoints };
    });

    const rewardsPerDay = dateRange.map(day => {
      const start = startOfDay(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const count = redeemedRewards.filter(r => new Date(r.earnedAt) >= start && new Date(r.earnedAt) <= end).length;
      return { date: format(day, "dd/MM"), count };
    });

    return NextResponse.json({
      customerGrowth,
      pointsPerDay,
      rewardsPerDay,
      totalCustomers: customers.length,
      totalPoints: customers.reduce((sum, c) => sum + c.points, 0),
      totalVisits: visits.length,
      totalRewardsRedeemed: redeemedRewards.length,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    // Always return a valid JSON structure, never crash
    return NextResponse.json({
      customerGrowth: [],
      pointsPerDay: [],
      rewardsPerDay: [],
      totalCustomers: 0,
      totalPoints: 0,
      totalVisits: 0,
      totalRewardsRedeemed: 0,
    });
  }
}