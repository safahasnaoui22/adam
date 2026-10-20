// app/api/pwa/[restaurantId]/icon/route.ts
//
// Turns the logo the owner uploaded under "Logo du commerce" (stored as a
// base64 data URL) into a real, square, opaque PNG that phones accept as an
// app icon.
//
//   /api/pwa/<id>/icon?size=192                      -> normal icon
//   /api/pwa/<id>/icon?size=512&purpose=maskable     -> extra padding, so
//                                                       Android's round/
//                                                       squircle mask won't
//                                                       crop the logo
//   add &v=<timestamp> to cache-bust after a logo change
//   add &debug=1 to see which renderer was used (or why it fell back)
//
// This route must NEVER answer with a server error: Chrome refuses to offer
// "Install app" if the manifest's icons fail. So every step is guarded:
//   1. sharp (fast, high quality)          — loaded lazily, in case the native
//                                            module is missing on the server
//   2. next/og (no native dependency)      — used if sharp is unavailable
//   3. the default Adam icon (redirect)    — used if both fail or no logo
//
// The failure that prompted this: both icons returned HTTP 500 on Vercel.

import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { createElement } from "react";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_SIZES = [48, 72, 96, 144, 180, 192, 512];

// Chrome (and Google's WebAPK service) download several icons in a row before
// it offers "Install". Finished icons are kept in memory (keyed by restaurant +
// version + size) and also cached by the CDN.
const ICON_CACHE = new Map<string, Buffer>();
const ICON_CACHE_MAX = 60;
function remember(key: string, icon: Buffer) {
  if (ICON_CACHE.size >= ICON_CACHE_MAX) {
    const oldest = ICON_CACHE.keys().next().value;
    if (oldest !== undefined) ICON_CACHE.delete(oldest);
  }
  ICON_CACHE.set(key, icon);
}

function pngResponse(icon: Buffer, versioned: boolean) {
  return new NextResponse(new Uint8Array(icon), {
    headers: {
      "Content-Type": "image/png",
      // With ?v=<timestamp> the URL changes whenever the restaurant is updated,
      // so it can be cached for a year (browser AND Vercel's CDN).
      // Without it, only 1 hour.
      "Cache-Control": versioned
        ? "public, max-age=31536000, s-maxage=31536000, immutable"
        : "public, max-age=3600, s-maxage=3600",
    },
  });
}

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

function shortMessage(e: unknown) {
  return (e instanceof Error ? e.message : String(e)).replace(/\s+/g, " ").slice(0, 300);
}

// 1. sharp
async function renderWithSharp(input: Buffer, size: number, scale: number): Promise<Buffer> {
  const { default: sharp } = await import("sharp"); // lazy: a missing native module must not break the route
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
  return sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: logoPng }])
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// 2. next/og — no native dependency (PNG, JPEG, GIF and SVG logos)
async function renderWithOg(dataUrl: string, size: number, scale: number): Promise<Buffer> {
  const inner = Math.max(1, Math.round(size * scale));
  const image = new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        },
      },
      createElement("img", {
        src: dataUrl,
        width: inner,
        height: inner,
        style: { objectFit: "contain" },
      })
    ),
    { width: size, height: size }
  );
  return Buffer.from(await image.arrayBuffer());
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
  const debug = sp.get("debug") === "1";

  const versioned = sp.has("v");
  const cacheKey = `${restaurantId}:${sp.get("v")}:${size}:${purpose}`;
  if (versioned && !debug) {
    const cached = ICON_CACHE.get(cacheKey);
    if (cached) return pngResponse(cached, true);
  }

  const started = Date.now();
  const notes: string[] = [];

  let logo: string | null = null;
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { logo: true },
    });
    logo = restaurant?.logo ?? null;
    if (!restaurant) notes.push("restaurant not found");
    else if (!logo) notes.push("restaurant has no logo");
  } catch (e) {
    console.error("PWA icon: database error:", e);
    notes.push("database error"); // deliberately no details
  }

  let icon: Buffer | null = null;
  let used: "sharp" | "og" | "default" = "default";
  const input = logo ? readDataUrl(logo) : null;
  if (logo && !input) notes.push("logo is not a base64 data URL");

  if (logo && input) {
    // The logo fills 86% of the icon; 60% for maskable (safe zone of the mask).
    const scale = purpose === "maskable" ? 0.6 : 0.86;

    try {
      icon = await renderWithSharp(input, size, scale);
      used = "sharp";
    } catch (e) {
      console.error("PWA icon: sharp failed:", e);
      notes.push(`sharp: ${shortMessage(e)}`);
    }

    if (!icon) {
      try {
        icon = await renderWithOg(logo, size, scale);
        used = "og";
      } catch (e) {
        console.error("PWA icon: next/og failed:", e);
        notes.push(`og: ${shortMessage(e)}`);
      }
    }
  }

  if (debug) {
    return NextResponse.json({
      used,
      ms: Date.now() - started,
      logoBytes: input ? input.length : 0,
      notes,
    });
  }

  if (!icon) return fallback(size, req);

  if (versioned) remember(cacheKey, icon);
  return pngResponse(icon, versioned);
}