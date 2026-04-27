import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { startOfDay, subDays, eachDayOfInterval, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = session.user.restaurantId;

    // Get all customers
    const customers = await prisma.customerProfile.findMany({
      where: { restaurantId },
      select: { createdAt: true, points: true },
    });

    // Get all visits (points added events)
    const visits = await prisma.visit.findMany({
      where: {
        customer: { restaurantId },
      },
      select: { date: true, pointsEarned: true },
      orderBy: { date: "asc" },
    });

    // Get all redeemed rewards
    const redeemedRewards = await prisma.earnedReward.findMany({
      where: {
        customer: { restaurantId },
      },
      select: { earnedAt: true },
      orderBy: { earnedAt: "asc" },
    });

    // Customer growth over last 30 days
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    const customerGrowth = dateRange.map(day => {
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
      const count = customers.filter(c => new Date(c.createdAt) <= endOfDay).length;
      return { date: format(day, "dd/MM"), count };
    });

    // Points added per day (last 30 days)
    const pointsPerDay = dateRange.map(day => {
      const start = startOfDay(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const totalPoints = visits
        .filter(v => new Date(v.date) >= start && new Date(v.date) <= end)
        .reduce((sum, v) => sum + v.pointsEarned, 0);
      return { date: format(day, "dd/MM"), points: totalPoints };
    });

    // Rewards redeemed per day (last 30 days)
    const rewardsPerDay = dateRange.map(day => {
      const start = startOfDay(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const count = redeemedRewards.filter(r => new Date(r.earnedAt) >= start && new Date(r.earnedAt) <= end).length;
      return { date: format(day, "dd/MM"), count };
    });

    // Totals
    const totalCustomers = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
    const totalVisits = visits.length;
    const totalRewardsRedeemed = redeemedRewards.length;

    return NextResponse.json({
      customerGrowth,
      pointsPerDay,
      rewardsPerDay,
      totalCustomers,
      totalPoints,
      totalVisits,
      totalRewardsRedeemed,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: String(error) },
      { status: 500 }
    );
  }
}