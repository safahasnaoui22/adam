// app/api/restaurant/generate-qr/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import QRCode from "qrcode";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.user.restaurantId },
      select: { urlSlug: true, name: true, id: true }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // ✅ Generate the correct client dashboard URL with restaurantId parameter
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://adamrestaurents.vercel.app";
    const url = `${baseUrl}/client/dashboard?restaurantId=${restaurant.id}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#fe5502',
        light: '#ffffff'
      }
    });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      url: url,
      restaurantName: restaurant.name
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}