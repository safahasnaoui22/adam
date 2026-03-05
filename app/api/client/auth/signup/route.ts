import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, restaurantId } = body;

    if (!name || !restaurantId) {
      return NextResponse.json(
        { error: "Name and restaurant ID are required" },
        { status: 400 }
      );
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Generate a unique customer ID
    const customerCount = await prisma.customerProfile.count({
      where: { restaurantId },
    });
    const customerId = `CUST${String(customerCount + 1).padStart(4, '0')}`;

    // Create user account for customer
    const user = await prisma.user.create({
      data: {
        name,
        email: `${customerId}@${restaurant.urlSlug}.stampi.tn`, // Generate a unique email
        password: "", // Customers don't need password - they use QR login
        role: "CUSTOMER",
        customerProfile: {
          create: {
            name,
            customerId,
            restaurantId,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    return NextResponse.json({
      message: "Customer account created successfully",
      client: {
        id: user.customerProfile?.id,
        name: user.name,
        customerId: user.customerProfile?.customerId,
        points: user.customerProfile?.points,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Client signup error:", error);
    return NextResponse.json(
      { error: "Failed to create customer account" },
      { status: 500 }
    );
  }
}