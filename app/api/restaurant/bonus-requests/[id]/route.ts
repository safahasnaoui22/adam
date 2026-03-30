import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action, rejectReason } = await req.json();

    const request = await prisma.bonusRequest.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            googleMapsBonusStars: true,
            facebookBonusStars: true,
            instagramBonusStars: true,
            twitterBonusStars: true,
          },
        },
      },
    });

    if (!request || request.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Get star value based on platform
      const starMap = {
        googleMaps: "googleMapsBonusStars",
        facebook: "facebookBonusStars",
        instagram: "instagramBonusStars",
        twitter: "twitterBonusStars",
      };
      
      const starField = starMap[request.platform as keyof typeof starMap];
      const starsToAdd = request.restaurant[starField as keyof typeof request.restaurant] as number || 50;

      // Update customer points and claimed flag
      const columnMap = {
        googleMaps: "hasClaimedGoogleMapsBonus",
        facebook: "hasClaimedFacebookBonus",
        instagram: "hasClaimedInstagramBonus",
        twitter: "hasClaimedTwitterBonus",
      };
      
      const claimField = columnMap[request.platform as keyof typeof columnMap];

      await prisma.$transaction([
        prisma.customerProfile.update({
          where: { id: request.customerId },
          data: {
            [claimField]: true,
            points: { increment: starsToAdd },
          },
        }),
        prisma.bonusRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({ success: true, starsAdded: starsToAdd });
    } 
    
    else if (action === "reject") {
      await prisma.bonusRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectedReason: rejectReason || "Non vérifié",
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process bonus request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}