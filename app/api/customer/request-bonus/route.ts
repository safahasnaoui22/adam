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

    // Get customer with all fields using include
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      include: {
        restaurant: {
          select: {
            id: true,
            googleMapsBonusStars: true,
            facebookBonusStars: true,
            instagramBonusStars: true,
            twitterBonusStars: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if already claimed - using type assertion since fields exist on customer
    const claimedMap: Record<string, boolean> = {
      googleMaps: (customer as any).hasClaimedGoogleMapsBonus || false,
      facebook: (customer as any).hasClaimedFacebookBonus || false,
      instagram: (customer as any).hasClaimedInstagramBonus || false,
      twitter: (customer as any).hasClaimedTwitterBonus || false,
    };

    if (claimedMap[platform]) {
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