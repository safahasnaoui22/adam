import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ restaurantId: string }> }
) {
    try {
        const { restaurantId } = await context.params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                id: true,
                name: true,
                logo: true,
                appName: true,
                theme: true,
                backgroundPattern: true,
            },
        });

        if (!restaurant) {
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(restaurant);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch restaurant" },
            { status: 500 }
        );
    }
}