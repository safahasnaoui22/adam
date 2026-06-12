import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { subscription, clientId } = await req.json();

  await prisma.client.update({
    where: {
      id: clientId,
    },
    data: {
      pushSubscription: JSON.stringify(subscription),
    },
  });

  return NextResponse.json({ success: true });
}