import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          }
        },
        subscription: true,
        _count: {
          select: {
            customers: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}