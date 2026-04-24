import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. Ensure the user is a restaurant owner
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized – restaurant owner only" }, { status: 401 });
    }

    // 2. Parse request body
    const { customerId, amount } = await request.json();
    if (!customerId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: "Invalid customerId or amount" }, { status: 400 });
    }

    // 3. Verify that the customer belongs to this restaurant
    const customer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        restaurantId: session.user.restaurantId,
      },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found for this restaurant" }, { status: 404 });
    }

    // 4. Calculate points (1 DT = 10 stars)
    const pointsToAdd = Math.floor(amount * 10);

    // 5. Update customer points and record a visit in a transaction
    const [updatedCustomer] = await prisma.$transaction([
      prisma.customerProfile.update({
        where: { id: customerId },
        data: { points: { increment: pointsToAdd } },
      }),
      prisma.visit.create({
        data: {
          customerId,
          amount: amount,
          pointsEarned: pointsToAdd,
          stampsEarned: 0, // can be configured later
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
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