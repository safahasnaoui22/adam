import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const client = await prisma.customerProfile.findUnique({
      where: { id: params.clientId },
      include: {
        visits: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        earnedRewards: {
          include: { reward: true },
          where: { usedAt: null },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...client,
      visits: client.visits.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}