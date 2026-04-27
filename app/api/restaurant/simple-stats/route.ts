import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { subDays, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = session.user.restaurantId;

    // Get overall stats
    const customers = await prisma.customerProfile.findMany({
      where: { restaurantId },
      select: { createdAt: true, points: true },
    });
    const visits = await prisma.visit.findMany({
      where: { customer: { restaurantId } },
      select: { pointsEarned: true },
    });

    const totalCustomers = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
    const totalVisits = visits.length;

    // Get daily growth for last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date: format(date, "dd/MM"),
        startOfDay: new Date(date.setHours(0, 0, 0, 0)),
        endOfDay: new Date(date.setHours(23, 59, 59, 999)),
      };
    });

    const weeklyGrowth = last7Days.map((day) => ({
      date: day.date,
      count: customers.filter((c) => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= day.startOfDay && createdAt <= day.endOfDay;
      }).length,
    }));

    return NextResponse.json({
      totalCustomers,
      totalPoints,
      totalVisits,
      weeklyGrowth,
    });
  } catch (error) {
    console.error("Simple stats error:", error);
    return NextResponse.json({
      totalCustomers: 0,
      totalPoints: 0,
      totalVisits: 0,
      weeklyGrowth: [],
    });
  }
}