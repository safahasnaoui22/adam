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

    const { platform, pageId } = await req.json();
    const accessToken = session.accessToken;

    let verified = false;
    let pointsToAdd = 0;

    const customer = await prisma.customerProfile.findUnique({
      where: { id: session.user.customerProfile.id },
      include: { restaurant: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get star values from restaurant
    const starMap = {
      facebook: customer.restaurant.facebookBonusStars || 50,
      instagram: customer.restaurant.instagramBonusStars || 50,
      twitter: customer.restaurant.twitterBonusStars || 50,
      tiktok: customer.restaurant.tiktokBonusStars || 50,
    };
    pointsToAdd = starMap[platform as keyof typeof starMap] || 50;

    switch (platform) {
      case "facebook": {
        // Check if user follows the page
        const res = await fetch(
          `https://graph.facebook.com/v18.0/me/likes?access_token=${accessToken}`
        );
        const data = await res.json();
        verified = data.data?.some((like: any) => like.id === pageId);
        break;
      }

      case "instagram": {
        // Check if user follows the account
        const res = await fetch(
          `https://graph.instagram.com/me/follows?access_token=${accessToken}`
        );
        const data = await res.json();
        verified = data.data?.some((follow: any) => follow.id === pageId);
        break;
      }

      case "twitter": {
        // Twitter API v2 - check if user follows account
        const res = await fetch(
          `https://api.twitter.com/2/users/me/following?user.fields=id&access_token=${accessToken}`
        );
        const data = await res.json();
        verified = data.data?.some((follow: any) => follow.id === pageId);
        break;
      }

      case "tiktok": {
        // TikTok API - check if user follows account
        const res = await fetch(
          `https://open-api.tiktok.com/user/info/?access_token=${accessToken}`
        );
        const data = await res.json();
        // Check if the user follows the specified account
        verified = data.data?.user?.following_count > 0;
        // You'll need to implement proper following check with TikTok's API
        break;
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: `Vous ne suivez pas encore cette page sur ${platform}` },
        { status: 400 }
      );
    }

    // Check if already claimed
    const claimedMap = {
      facebook: customer.hasClaimedFacebookBonus,
      instagram: customer.hasClaimedInstagramBonus,
      twitter: customer.hasClaimedTwitterBonus,
      tiktok: customer.hasClaimedTikTokBonus,
    };

    if (claimedMap[platform as keyof typeof claimedMap]) {
      return NextResponse.json({ error: "Bonus déjà réclamé" }, { status: 400 });
    }

    // Update customer points
    const columnMap = {
      facebook: "hasClaimedFacebookBonus",
      instagram: "hasClaimedInstagramBonus",
      twitter: "hasClaimedTwitterBonus",
      tiktok: "hasClaimedTikTokBonus",
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
      message: `${pointsToAdd}⭐ ajoutés! Merci d'avoir suivi notre page ${platform}!`,
    });
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json(
      { error: "Échec de la vérification. Veuillez réessayer." },
      { status: 500 }
    );
  }
}