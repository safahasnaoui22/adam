// app/api/pwa/[restaurantId]/manifest/route.ts
//
// One web-app manifest per restaurant: its own name and its own logo.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true, appName: true, urlSlug: true, updatedAt: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const v = restaurant.updatedAt.getTime();
  const icon = (size: number, purpose: "any" | "maskable") => ({
    src: `/api/pwa/${restaurantId}/icon?size=${size}&purpose=${purpose}&v=${v}`,
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose,
  });

  const startUrl = `/${restaurant.urlSlug}`;

  const manifest = {
    name: restaurant.name,
    short_name: restaurant.appName || restaurant.name.slice(0, 12),
    description: `Carte de fidélité ${restaurant.name}`,
    // Unique per restaurant, so a phone can install several restaurants'
    // apps side by side instead of treating them as the same app.
    id: startUrl,
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#fe5502",
    lang: "fr",
    icons: [
      icon(48, "any"),
      icon(72, "any"),
      icon(96, "any"),
      icon(144, "any"),
      icon(192, "any"),
      icon(192, "maskable"),
      icon(512, "any"),
      icon(512, "maskable"),
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}