import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/app/lib/prisma" //
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    // Only existing admins can create new admins
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}