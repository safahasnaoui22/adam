import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, pointsToDeduct } = await req.json();
    if (!customerId || pointsToDeduct <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Verify customer belongs to this restaurant
    const customer = await prisma.customerProfile.findFirst({
      where: { id: customerId, restaurantId: session.user.restaurantId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.points < pointsToDeduct) {
      return NextResponse.json({ error: "Points insuffisants" }, { status: 400 });
    }

    const updated = await prisma.customerProfile.update({
      where: { id: customerId },
      data: { points: { decrement: pointsToDeduct } },
    });

    return NextResponse.json({
      success: true,
      newPoints: updated.points,
      deducted: pointsToDeduct,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}