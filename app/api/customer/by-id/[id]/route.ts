// app/api/customer/by-id/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Try exact match on full customerId
    let customer = await prisma.customerProfile.findUnique({
      where: { customerId: id },
    });

    // 2. If not found, try to match by short ID (last 4 characters)
    if (!customer) {
      const candidates = await prisma.customerProfile.findMany({
        where: {
          customerId: { endsWith: id },
        },
        take: 1,
      });
      customer = candidates[0];
    }

    if (!customer) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // 3. Fetch available rewards for this customer's restaurant
    const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
      where: { restaurantId: customer.restaurantId },
      include: {
        rewards: {
          where: { isActive: true },
          orderBy: { pointsRequired: "asc" },
        },
      },
    });

    const rewards = loyaltyProgram?.rewards || [];

    return NextResponse.json({ customer, rewards });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}