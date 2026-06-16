// app/api/push/subscribe/route.ts
// POST: save a new push subscription for the current client
// DELETE: remove a subscription (unsubscribe)
//
// Confirmed against schema.prisma:
//   CustomerProfile.id          → Prisma cuid (e.g. "cm...")
//   CustomerProfile.customerId  → custom "CUST-..." string, @unique
//   PushSubscription.clientId   → FK to CustomerProfile.id

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // ← confirm this matches your actual prisma client path

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, clientId } = body;

    console.log("[push/subscribe] incoming clientId:", clientId);

    if (!subscription || !clientId) {
      return NextResponse.json({ error: "Missing subscription or clientId" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      console.error("[push/subscribe] invalid subscription shape:", subscription);
      return NextResponse.json({ error: "Invalid subscription format" }, { status: 400 });
    }

    // ── Resolve the real CustomerProfile.id ──────────────────────────
    // localStorage's clientId is the "CUST-..." string (CustomerProfile.customerId),
    // not the Prisma cuid (CustomerProfile.id). Look it up by customerId first.
    const customer = await prisma.customerProfile.findUnique({
      where: { customerId: clientId },
      select: { id: true },
    });

    if (!customer) {
      console.error("[push/subscribe] could not resolve customer for clientId:", clientId);
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const resolvedCustomerId = customer.id;

    // Upsert — if same endpoint exists, update it
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        clientId: resolvedCustomerId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        clientId: resolvedCustomerId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    console.log("[push/subscribe] saved for customer:", resolvedCustomerId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe] FATAL error:", err);
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({ where: { endpoint } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe DELETE] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}