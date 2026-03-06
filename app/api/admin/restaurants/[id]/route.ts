import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
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
        subscription: true,
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

    // Get recent customers
    const recentCustomers = await prisma.customerProfile.findMany({
      where: { restaurantId: params.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      ...restaurant,
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