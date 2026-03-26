// app/api/restaurant/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.restaurantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fix: Select fields correctly - plan comes from subscription, not restaurant
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: session.user.restaurantId },
            select: {
                accountStatus: true,
                id: true,
                name: true,
                subscription: {
                    select: {
                        plan: true
                    }
                }
            }
        });

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        return NextResponse.json({
            accountStatus: restaurant.accountStatus,
            plan: restaurant.subscription?.plan || "FREE",
            id: restaurant.id,
            name: restaurant.name
        });
    } catch (error) {
        console.error("Failed to fetch restaurant status:", error);
        return NextResponse.json(
            { error: "Failed to fetch status" },
            { status: 500 }
        );
    }
}