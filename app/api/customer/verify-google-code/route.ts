import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.customerProfile?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    const restaurant = await prisma.restaurant.findFirst({
      where: { googleMapsCode: code },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { id: session.user.customerProfile.id },
    });

    if (customer?.hasClaimedGoogleMapsBonus) {
      return NextResponse.json({ error: "Bonus déjà réclamé" }, { status: 400 });
    }

    const pointsToAdd = restaurant.googleMapsBonusStars || 50;

    await prisma.customerProfile.update({
      where: { id: session.user.customerProfile.id },
      data: {
        hasClaimedGoogleMapsBonus: true,
        points: { increment: pointsToAdd },
      },
    });

    return NextResponse.json({ 
      success: true, 
      pointsAdded: pointsToAdd,
      message: `${pointsToAdd}⭐ ajoutés pour votre avis Google!`
    });
  } catch (error) {
    return NextResponse.json({ error: "Échec de vérification" }, { status: 500 });
  }
}