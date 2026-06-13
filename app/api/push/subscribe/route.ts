// app/api/push/subscribe/route.ts
// POST: save a new push subscription for the current client
// DELETE: remove a subscription (unsubscribe)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// ── You need this Prisma model (add to schema.prisma) ─────────────────
//
// model PushSubscription {
//   id         String   @id @default(cuid())
//   clientId   String
//   endpoint   String   @unique
//   p256dh     String
//   auth       String
//   createdAt  DateTime @default(now())
//   client     Customer @relation(fields: [clientId], references: [id], onDelete: Cascade)
// }
//
// And on Customer model:
//   pushSubscriptions PushSubscription[]
// ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, clientId } = body;

    if (!subscription || !clientId) {
      return NextResponse.json({ error: "Missing subscription or clientId" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription format" }, { status: 400 });
    }

    // Upsert — if same endpoint exists, update it
    await (prisma as any).pushSubscription.upsert({
      where: { endpoint },
      create: {
        clientId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        clientId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await (prisma as any).pushSubscription.deleteMany({ where: { endpoint } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe DELETE] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}