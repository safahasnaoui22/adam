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

    const { platform, customerId, proofName } = await req.json();
    
    if (customerId !== session.user.customerProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get customer to find restaurant
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: { restaurantId: true, hasClaimedGoogleMapsBonus: true, hasClaimedFacebookBonus: true, hasClaimedInstagramBonus: true, hasClaimedTwitterBonus: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if already claimed this bonus
    const claimedMap = {
      googleMaps: customer.hasClaimedGoogleMapsBonus,
      facebook: customer.hasClaimedFacebookBonus,
      instagram: customer.hasClaimedInstagramBonus,
      twitter: customer.hasClaimedTwitterBonus,
    };

    if (claimedMap[platform as keyof typeof claimedMap]) {
      return NextResponse.json({ error: "Bonus déjà réclamé" }, { status: 400 });
    }

    // Check if there's already a pending request for this platform
    const existingRequest = await prisma.bonusRequest.findFirst({
      where: {
        customerId,
        platform,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Demande déjà envoyée, en attente de vérification" }, { status: 400 });
    }

    // Create bonus request
    const bonusRequest = await prisma.bonusRequest.create({
      data: {
        customerId,
        restaurantId: customer.restaurantId,
        platform,
        status: "PENDING",
        proofName: proofName || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demande envoyée! Le restaurateur vérifiera et ajoutera vos points sous 24h.",
      requestId: bonusRequest.id,
    });
  } catch (error) {
    console.error("Failed to create bonus request:", error);
    return NextResponse.json({ error: "Failed to create bonus request" }, { status: 500 });
  }
}