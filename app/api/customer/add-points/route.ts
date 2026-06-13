// app/api/customer/add-points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendPushToClient } from "@/lib/webpush";
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate restaurant owner
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json(
        { error: "Unauthorized – restaurant owner only" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const { customerId, amount } = await request.json();
    if (!customerId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid customerId or amount" },
        { status: 400 }
      );
    }

    // 3. Verify customer belongs to this restaurant
    const customer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        restaurantId: session.user.restaurantId,
      },
      include: {
        pushSubscriptions: true, // ← load subscriptions
      },
    });
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found for this restaurant" },
        { status: 404 }
      );
    }

    // 4. Calculate points
    const loyaltyRule = await prisma.loyaltyProgram.findFirst({
      where: { restaurantId: session.user.restaurantId },
    });
    const spendThreshold = loyaltyRule?.spendThreshold ?? 1;
    const pointsEarned   = loyaltyRule?.pointsEarned   ?? 10;
    const pointsToAdd    = Math.floor((amount / spendThreshold) * pointsEarned);

    // 5. Update points + record visit
    const [updatedCustomer] = await prisma.$transaction([
      prisma.customerProfile.update({
        where: { id: customerId },
        data: { points: { increment: pointsToAdd } },
      }),
      prisma.visit.create({
        data: {
          customerId,
          amount,
          pointsEarned: pointsToAdd,
          stampsEarned: 0,
        },
      }),
    ]);

    // 6. Send push notification (fire and forget — never blocks the response)
    if (customer.pushSubscriptions?.length > 0) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: session.user.restaurantId },
        select: { logo: true, name: true },
      });

      const subscriptions = customer.pushSubscriptions.map((s: any) => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      }));

      sendPushToClient(
        customerId,
        subscriptions,
        {
          title: "🎉 Points ajoutés !",
          body: `+${pointsToAdd} points ajoutés à votre carte. Solde : ${updatedCustomer.points} pts`,
          icon: restaurant?.logo || "/icon-192x192.png",
          badge: "/icon-72x72.png",
          tag: "adam-points",
          data: {
            url: "/client/dashboard",
            pointsAdded: pointsToAdd,
            newTotal: updatedCustomer.points,
          },
        },
        // Auto-delete expired subscriptions
        async (endpoint: string) => {
          await prisma.pushSubscription.deleteMany({ where: { endpoint } });
        }
      ).catch(console.error); // never let push crash the route
    }

    // 7. Return success
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