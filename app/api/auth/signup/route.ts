import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📝 New restaurant signup:", body.email);

    const { cafeName, email, password, phoneNumber } = body;

    // Validate required fields
    if (!cafeName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate URL slug from cafe name
    const urlSlug = cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || "cafe";

    // Create user with restaurant - status PENDING by default
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
            accountStatus: "PENDING", // Explicitly set to PENDING
          },
        },
      },
      include: {
        restaurant: true,
      },
    });

    console.log("✅ New restaurant created:", {
      id: user.restaurant?.id,
      name: cafeName,
      status: "PENDING"
    });

    // Optional: Create an admin notification
    await prisma.adminLog.create({
      data: {
        adminId: "", // This will be handled by a trigger or leave empty
        action: "NEW_RESTAURANT_SIGNUP",
        targetType: "RESTAURANT",
        targetId: user.restaurant?.id || "",
        details: {
          restaurantName: cafeName,
          email: email,
          phone: phoneNumber,
          signedUpAt: new Date().toISOString()
        },
      },
    });

    return NextResponse.json(
      {
        message: "Restaurant account created successfully. Waiting for admin approval.",
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
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}