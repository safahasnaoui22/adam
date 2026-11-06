import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { readBonusToken } from "@/lib/bonusToken";

// The dashboard waits BONUS_WAIT_SECONDS (20s) after the customer opens the
// platform link. Allow a little slack for network latency.
const MIN_WAIT_MS = 15_000;
const MAX_AGE_MS = 60 * 60 * 1000; // token valid for 1 hour

const COLUMN: Record<string, "hasClaimedGoogleMapsBonus" | "hasClaimedFacebookBonus" | "hasClaimedInstagramBonus" | "hasClaimedTwitterBonus"> = {
  googleMaps: "hasClaimedGoogleMapsBonus",
  facebook: "hasClaimedFacebookBonus",
  instagram: "hasClaimedInstagramBonus",
  twitter: "hasClaimedTwitterBonus",
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // The customer is always the logged-in one — never trust an id from the body.
    const customerId = session?.user?.customerProfile?.id;
    if (!customerId) {
      return NextResponse.json({ error: "Session expirée. Reconnectez-vous puis réessayez." }, { status: 401 });
    }

    const { platform, token } = await req.json();
    const column = COLUMN[platform];
    if (!column) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Proof that the customer opened the link, and for how long ago.
    const elapsed = token ? readBonusToken(token, customerId, platform) : null;
    if (elapsed === null || elapsed > MAX_AGE_MS) {
      return NextResponse.json(
        { error: "Veuillez d'abord ouvrir le lien, effectuer l'action, puis confirmer." },
        { status: 400 }
      );
    }
    if (elapsed < MIN_WAIT_MS) {
      return NextResponse.json(
        { error: "Merci de patienter quelques secondes après avoir effectué l'action." },
        { status: 400 }
      );
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: { restaurant: { select: {
        googleMapsBonusStars: true,
        facebookBonusStars: true,
        instagramBonusStars: true,
        twitterBonusStars: true,
      } } },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const r = customer.restaurant;
    const pointsToAdd =
      (platform === "googleMaps" ? r.googleMapsBonusStars
        : platform === "facebook" ? r.facebookBonusStars
        : platform === "instagram" ? r.instagramBonusStars
        : r.twitterBonusStars) || 50;

    // Atomic "claim once": only flips the flag if it is still false, so two
    // simultaneous taps can never pay the bonus twice.
    const claimed = await prisma.customerProfile.updateMany({
      where: { id: customerId, [column]: false },
      data: { [column]: true, points: { increment: pointsToAdd } },
    });
    if (claimed.count === 0) {
      return NextResponse.json({ error: "Bonus already claimed" }, { status: 400 });
    }

    const updated = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: { points: true },
    });

    return NextResponse.json({
      success: true,
      newPoints: updated?.points ?? 0,
      pointsAdded: pointsToAdd,
    });
  } catch (error) {
    console.error("Failed to claim bonus:", error);
    return NextResponse.json({ error: "Failed to claim bonus" }, { status: 500 });
  }
}