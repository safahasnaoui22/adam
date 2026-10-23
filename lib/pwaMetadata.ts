// app/lib/pwaMetadata.ts
//
// Builds the <head> metadata that makes the phone install THIS business's app
// (its own name + the logo uploaded in "Personnaliser") instead of the generic
// BONOO / Adam one. Chrome binds the install prompt to the manifest of the page
// that was open when the event fired, so every page a customer can land on
// (the QR landing page AND the dashboard) must use it.
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";

export async function restaurantPwaMetadata(
  where: { id: string } | { urlSlug: string }
): Promise<Metadata> {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where,
      select: { id: true, name: true, appName: true, updatedAt: true },
    });
    if (!restaurant) return {};

    const base = `/api/pwa/${restaurant.id}`;
    const v = restaurant.updatedAt.getTime(); // changes when the logo is updated
    const title = restaurant.name || restaurant.appName;

    return {
      title,
      applicationName: title,
      manifest: `${base}/manifest?v=${v}`,
      appleWebApp: { capable: true, statusBarStyle: "black-translucent", title },
      icons: {
        icon: [{ url: `${base}/icon?size=192&v=${v}`, sizes: "192x192", type: "image/png" }],
        apple: [{ url: `${base}/icon?size=180&v=${v}`, sizes: "180x180" }],
      },
    };
  } catch {
    return {};
  }
}
