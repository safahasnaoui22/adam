// lib/webpush.ts
// Run once to generate keys: npx web-push generate-vapid-keys
// Then add to .env:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_SUBJECT=mailto:you@yourdomain.com

import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@adamloyalty.app";

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("[webpush] VAPID keys not set — push notifications disabled");
} else {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a push notification to one subscription.
 * Returns true on success, false on failure.
 * Automatically handles expired/invalid subscriptions (410 = should delete).
 */
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; shouldDelete?: boolean }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { success: false };
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (err: any) {
    const statusCode = err?.statusCode ?? err?.status;
    // 404 or 410 = subscription is gone, delete it from DB
    if (statusCode === 404 || statusCode === 410) {
      return { success: false, shouldDelete: true };
    }
    console.error("[webpush] send error", statusCode, err?.body);
    return { success: false };
  }
}

/**
 * Send push to all subscriptions of a client.
 * Pass the subscriptions array from Prisma, clean up expired ones.
 */
export async function sendPushToClient(
  clientId: string,
  subscriptions: webpush.PushSubscription[],
  payload: PushPayload,
  onDeleteSubscription?: (endpoint: string) => Promise<void>
): Promise<void> {
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      if (result.shouldDelete && onDeleteSubscription) {
        await onDeleteSubscription(sub.endpoint);
      }
    })
  );
}