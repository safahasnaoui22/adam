import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.customerProfile?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, points, reason } = await request.json();

    // Verify that the customer belongs to the logged-in user
    if (customerId !== session.user.customerProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: limit how often a user can claim review points (e.g., once)
    // For simplicity, we'll just add points

    const updatedCustomer = await prisma.customerProfile.update({
      where: { id: customerId },
      data: {
        points: { increment: points },
        // You could log the action in a separate table
      },
    });

    // Also add a visit record? Not necessary for review points
    return NextResponse.json({
      success: true,
      newPoints: updatedCustomer.points,
    });
  } catch (error) {
    console.error("Failed to add points:", error);
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    );
  }
}