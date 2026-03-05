import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.restaurantId },
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
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
  }
}