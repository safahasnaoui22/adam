import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma"; // Fixed: removed curly braces

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received signup data:", body);

    const { cafeName, email, password, phoneNumber } = body;

    // Validate required fields
    if (!cafeName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: cafeName, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate URL slug from cafe name
    const urlSlug = cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create user with restaurant
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: cafeName,
        phoneNumber,
        role: "RESTAURANT_OWNER",
        restaurant: {
          create: {
            name: cafeName,
            appName: cafeName.substring(0, 12),
            urlSlug: urlSlug,
            phoneNumber,
            email,
          },
        },
      },
      include: {
        restaurant: true,
      },
    });

    console.log("User created successfully:", user.id);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          restaurantId: user.restaurant?.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error details:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}