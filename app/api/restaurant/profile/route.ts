// app/api/restaurant/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
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
            include: {
                subscription: true, // Include subscription to get plan
                loyaltyProgram: {
                    include: {
                        rewards: true,
                    },
                },
                _count: {
                    select: {
                        customers: true
                    }
                }
            }
        });

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        // Get plan from subscription
        const plan = restaurant.subscription?.plan || "FREE";

        // Check if account is suspended - return 403 for suspended accounts
        if (restaurant.accountStatus === "SUSPENDED") {
            return NextResponse.json(
                { 
                    error: "Account suspended", 
                    restaurant: {
                        ...restaurant,
                        plan: plan,
                        isSuspended: true,
                        accountStatus: restaurant.accountStatus,
                    } 
                }, 
                { status: 403 }
            );
        }

        // Return restaurant with status and plan info
        return NextResponse.json({
            ...restaurant,
            plan: plan,
            accountStatus: restaurant.accountStatus,
        });
    } catch (error) {
        console.error("Failed to fetch restaurant:", error);
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
      // Add these new fields
      googleMapsUrl,
      facebookUrl,
      instagramUrl,
      twitterUrl,
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
        // Add the new fields here
        googleMapsUrl: googleMapsUrl || undefined,
        facebookUrl: facebookUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        twitterUrl: twitterUrl || undefined,
      },
      include: {
        subscription: true,
      },
    });

    const plan = restaurant.subscription?.plan || "FREE";

    return NextResponse.json({
      ...restaurant,
      plan: plan,
      accountStatus: restaurant.accountStatus,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
  }
}

// HEAD endpoint to check restaurant status (fixed version)
export async function HEAD() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.restaurantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fix: Use only select OR include, not both
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
        return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
    }
}