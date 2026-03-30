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

    const { platform, customerId } = await req.json();
    if (customerId !== session.user.customerProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Map platform to database column names
    const columnMap: Record<string, string> = {
      googleMaps: "hasClaimedGoogleMapsBonus",
      facebook: "hasClaimedFacebookBonus",
      instagram: "hasClaimedInstagramBonus",
      twitter: "hasClaimedTwitterBonus",
    };

    const column = columnMap[platform];
    if (!column) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Get the customer to find their restaurant
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: { restaurantId: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get the restaurant's bonus star settings
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: customer.restaurantId },
      select: {
        googleMapsBonusStars: true,
        facebookBonusStars: true,
        instagramBonusStars: true,
        twitterBonusStars: true,
      },
    });

    // Determine how many stars to add
    let pointsToAdd = 50; // default
    switch (platform) {
      case "googleMaps":
        pointsToAdd = restaurant?.googleMapsBonusStars || 50;
        break;
      case "facebook":
        pointsToAdd = restaurant?.facebookBonusStars || 50;
        break;
      case "instagram":
        pointsToAdd = restaurant?.instagramBonusStars || 50;
        break;
      case "twitter":
        pointsToAdd = restaurant?.twitterBonusStars || 50;
        break;
    }

    // Check if already claimed
    const existingCustomer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: { [column]: true },
    });

    if (existingCustomer?.[column]) {
      return NextResponse.json({ error: "Bonus already claimed" }, { status: 400 });
    }

    // Update the flag and add points
    const updated = await prisma.customerProfile.update({
      where: { id: customerId },
      data: {
        [column]: true,
        points: { increment: pointsToAdd },
      },
    });

    return NextResponse.json({ 
      success: true, 
      newPoints: updated.points,
      pointsAdded: pointsToAdd 
    });
  } catch (error) {
    console.error("Failed to claim bonus:", error);
    return NextResponse.json({ error: "Failed to claim bonus" }, { status: 500 });
  }
}