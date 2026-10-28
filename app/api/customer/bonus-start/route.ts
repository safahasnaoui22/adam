import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { signBonusToken } from "@/lib/bonusToken";

// Called when the customer taps "Ouvrir <plateforme>". Starts the server-side timer.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.customerProfile?.id;
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform } = await req.json();
  if (!["googleMaps", "facebook", "instagram", "twitter"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  return NextResponse.json({ token: signBonusToken(customerId, platform) });
}
