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

    const { platform, accessToken, pageId } = await req.json();

    let verified = false;
    let pointsToAdd = 0;

    // Get restaurant bonus settings
    const customer = await prisma.customerProfile.findUnique({
      where: { id: session.user.customerProfile.id },
      include: { restaurant: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    switch (platform) {
      case "facebook":
        // Verify if user follows the page
        const fbRes = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/likes?access_token=${accessToken}`
        );
        const fbData = await fbRes.json();
        verified = fbData.data?.length > 0;
        pointsToAdd = customer.restaurant.facebookBonusStars || 50;
        break;

      case "instagram":
        // Verify if user follows the Instagram account
        const igRes = await fetch(
          `https://graph.instagram.com/me/follows?access_token=${accessToken}`
        );
        const igData = await igRes.json();
        verified = igData.data?.some((follow: any) => follow.id === pageId);
        pointsToAdd = customer.restaurant.instagramBonusStars || 50;
        break;

      case "twitter":
        // Twitter API v2 verification
        const twitterRes = await fetch(
          `https://api.twitter.com/2/users/me/following?user.fields=id&access_token=${accessToken}`
        );
        const twitterData = await twitterRes.json();
        verified = twitterData.data?.some((follow: any) => follow.id === pageId);
        pointsToAdd = customer.restaurant.twitterBonusStars || 50;
        break;
    }

    if (!verified) {
      return NextResponse.json({ error: "Vous ne suivez pas encore cette page" }, { status: 400 });
    }

    // Update customer points
    const columnMap = {
      facebook: "hasClaimedFacebookBonus",
      instagram: "hasClaimedInstagramBonus",
      twitter: "hasClaimedTwitterBonus",
    };

    await prisma.customerProfile.update({
      where: { id: session.user.customerProfile.id },
      data: {
        [columnMap[platform as keyof typeof columnMap]]: true,
        points: { increment: pointsToAdd },
      },
    });

    return NextResponse.json({ 
      success: true, 
      pointsAdded: pointsToAdd,
      message: `${pointsToAdd}⭐ ajoutés!`
    });
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json({ error: "Échec de la vérification" }, { status: 500 });
  }
}