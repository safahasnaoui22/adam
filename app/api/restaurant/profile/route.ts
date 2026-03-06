import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/app/lib/prisma"
import { authOptions } from "@/app/lib/auth";

// GET restaurant profile
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

        return NextResponse.json(restaurant);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
    }
}

// UPDATE restaurant profile
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.restaurantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const {
            name,
            description,
            logo,
            address,
            phoneNumber,
            email,
            website,
            openingHours,
            socialMedia,
            termsConditions,
            howToUse,
            revenueSettings,
            appName,
            urlSlug,
            theme,
            backgroundPattern,
        } = body;

        // Check if urlSlug is already taken (excluding current restaurant)
        if (urlSlug) {
            const existing = await prisma.restaurant.findFirst({
                where: {
                    urlSlug,
                    NOT: { id: session.user.restaurantId },
                },
            });

            if (existing) {
                return NextResponse.json(
                    { error: "Cette URL est déjà prise" },
                    { status: 400 }
                );
            }
        }

        const restaurant = await prisma.restaurant.update({
            where: { id: session.user.restaurantId },
            data: {
                name,
                description,
                logo,
                address,
                phoneNumber,
                email,
                website,
                openingHours: openingHours || undefined,
                socialMedia: socialMedia || undefined,
                termsConditions,
                howToUse,
                revenueSettings: revenueSettings || undefined,
                appName,
                urlSlug,
                theme: theme || undefined,
                backgroundPattern,
            },
        });

        return NextResponse.json(restaurant);
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
    }
}