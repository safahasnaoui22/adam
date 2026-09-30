// app/api/pwa/[restaurantId]/icon/route.ts
//
// Turns the logo the owner uploaded under "Logo du commerce" (stored as a
// base64 data URL) into a real, square, opaque PNG that phones accept as
// an app icon.
//
//   /api/pwa/<id>/icon?size=192                      -> normal icon
//   /api/pwa/<id>/icon?size=512&purpose=maskable     -> extra padding, so
//                                                       Android's round/
//                                                       squircle mask won't
//                                                       crop the logo
//   add &v=<timestamp> to cache-bust after a logo change
//
// No logo (or unreadable logo) -> falls back to the default Adam icon.

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_SIZES = [48, 72, 96, 144, 180, 192, 512];

function fallback(size: number, req: NextRequest) {
  const path =
    size === 180 ? "/icons/apple-touch-icon.png" : `/icons/icon-${size}x${size}.png`;
  return NextResponse.redirect(new URL(path, req.url), 302);
}

// Only data URLs are supported (that is how the personalize page saves the
// logo). Remote URLs are deliberately NOT fetched, to avoid server-side
// request forgery through a user-controlled field.
function readDataUrl(logo: string): Buffer | null {
  if (!logo.startsWith("data:")) return null;
  const comma = logo.indexOf(",");
  if (comma === -1) return null;
  const meta = logo.slice(0, comma);
  const data = logo.slice(comma + 1);
  try {
    return meta.includes(";base64")
      ? Buffer.from(data, "base64")
      : Buffer.from(decodeURIComponent(data));
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;
  const sp = req.nextUrl.searchParams;

  const requested = parseInt(sp.get("size") || "192", 10);
  const size = ALLOWED_SIZES.includes(requested) ? requested : 192;
  const purpose = sp.get("purpose") === "maskable" ? "maskable" : "any";

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { logo: true },
  });

  if (!restaurant?.logo) return fallback(size, req);

  const input = readDataUrl(restaurant.logo);
  if (!input) return fallback(size, req);

  try {
    // The logo fills 86% of the icon; 60% for maskable (safe zone of the mask).
    const scale = purpose === "maskable" ? 0.6 : 0.86;
    const inner = Math.max(1, Math.round(size * scale));

    const logoPng = await sharp(input, { density: 300 }) // density: crisp SVG logos
      .rotate() // honour EXIF orientation from phone photos
      .resize(inner, inner, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    // White, fully opaque background: iOS turns transparent icons black.
    const icon = await sharp({
      create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([{ input: logoPng }])
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new NextResponse(new Uint8Array(icon), {
      headers: {
        "Content-Type": "image/png",
        // With ?v=<timestamp> the URL changes whenever the restaurant is
        // updated, so it can be cached for a year. Without it, only 1 hour.
        "Cache-Control": sp.has("v")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("PWA icon generation failed:", error);
    return fallback(size, req);
  }
}