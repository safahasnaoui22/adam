import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/app/lib/prisma"
import QRCode from "qrcode";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.restaurantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: session.user.restaurantId },
        });

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        // Generate QR code that points to client login page with restaurant ID
        const clientLoginUrl = `${process.env.NEXTAUTH_URL}/client/login?restaurantId=${restaurant.id}`;

        const qrCodeDataUrl = await QRCode.toDataURL(clientLoginUrl);

        // Save QR code to restaurant (optional)
        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { qrCode: qrCodeDataUrl },
        });

        return NextResponse.json({
            qrCode: qrCodeDataUrl,
            url: clientLoginUrl
        });
    } catch (error) {
        console.error("QR generation error:", error);
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}