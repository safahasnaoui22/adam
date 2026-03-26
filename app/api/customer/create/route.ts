// app/api/customer/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, restaurantId } = await request.json();

    if (!name || !restaurantId) {
      return NextResponse.json(
        { error: "Nom et restaurant requis" },
        { status: 400 }
      );
    }

    // Check if restaurant exists and is active
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { accountStatus: true, name: true }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant non trouvé" },
        { status: 404 }
      );
    }

    if (restaurant.accountStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Ce restaurant n'est pas encore actif" },
        { status: 403 }
      );
    }

    // Generate unique customer ID
    const customerId = `CUST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await hash(tempPassword, 10);

    // Create user and customer profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Check if user with this name already exists for this restaurant
      const existingCustomer = await tx.customerProfile.findFirst({
        where: {
          restaurantId,
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });

      if (existingCustomer) {
        throw new Error("Un client avec ce nom existe déjà dans ce restaurant");
      }

      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email: `${customerId}@temp.adam.tn`,
          password: hashedPassword,
          role: "CUSTOMER",
          customerProfile: {
            create: {
              name,
              customerId,
              restaurantId,
              points: 0,
              stamps: 0,
            },
          },
        },
        include: {
          customerProfile: true,
        },
      });

      // Add initial visit
      await tx.visit.create({
        data: {
          customerId: newUser.customerProfile!.id,
          pointsEarned: 0,
          stampsEarned: 0,
        },
      });

      return newUser;
    });

    // Return success with customer info (don't return password in production)
    return NextResponse.json({
      success: true,
      customer: {
        id: user.customerProfile?.id,
        name: user.customerProfile?.name,
        customerId: user.customerProfile?.customerId,
      },
      message: "Compte créé avec succès",
      // In production, you would send this password via email
      // For development, you can return it temporarily
      ...(process.env.NODE_ENV === "development" && { tempPassword }),
    });
  } catch (error: any) {
    console.error("Failed to create customer:", error);
    
    if (error.message === "Un client avec ce nom existe déjà dans ce restaurant") {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Impossible de créer le compte" },
      { status: 500 }
    );
  }
}