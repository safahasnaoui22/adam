import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.restaurantId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const cleanId = shortId.trim().replace(/^#/, "").toUpperCase();
  if (!cleanId) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const customer = await prisma.customerProfile.findFirst({
    where: {
      restaurantId: session.user.restaurantId,
      OR: [
        { customerId: cleanId },
        { customerId: { endsWith: cleanId } },
      ],
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  const includeRewards = req.nextUrl.searchParams.get("details") === "full";
  let rewards: { id: string; name: string; pointsRequired: number; description?: string }[] = [];

  if (includeRewards) {
    const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
      where: { restaurantId: session.user.restaurantId },
      include: {
        rewards: {
          where: { isActive: true },
          orderBy: { pointsRequired: "asc" },
        },
      },
    });
    rewards = (loyaltyProgram?.rewards || []).map((r) => ({
      id: r.id,
      name: r.name,
      pointsRequired: r.pointsRequired,
      description: r.description ?? undefined,
    }));
  }

  return NextResponse.json({
    customer: {
      id: customer.id,
      customerId: customer.customerId,
      name: customer.name,
      points: customer.points,
    },
    rewards,
  });
}