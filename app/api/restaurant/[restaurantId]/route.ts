import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ restaurantId: string }> }
) {
    try {
        const { restaurantId } = await context.params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                loyaltyProgram: {
                    include: {
                        rewards: {
                            orderBy: { pointsRequired: 'asc' }, // optional: sort by points
                        },
                    },
                },
            },
        });

        if (!restaurant) {
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: 404 }
            );
        }

        // Remove sensitive or unnecessary fields if needed, but keep rewards
        return NextResponse.json(restaurant);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch restaurant" },
            { status: 500 }
        );
    }
}