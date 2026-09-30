// app/client/dashboard/layout.tsx
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { prisma } from "../lib/prisma";
import { authOptions } from "../lib/auth";


// The customer's restaurant decides the manifest and the icons, so the
// app installed from this page carries the restaurant's own name and logo.
export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  const slug =
    session?.user?.role === "CUSTOMER" ? session.user.restaurantSlug : undefined;
  if (!slug) return {};

  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: slug },
    select: { id: true, name: true, appName: true, updatedAt: true },
  });
  if (!restaurant) return {};

  const base = `/api/pwa/${restaurant.id}`;
  const v = restaurant.updatedAt.getTime();
  const title = restaurant.appName || restaurant.name;

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
}

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Only CUSTOMER can access client dashboard
  if (session.user.role !== "CUSTOMER") {
    console.log("⚠️ Non-customer tried to access client area");

    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else if (session.user.role === "RESTAURANT_OWNER") {
      redirect("/dashboard");
    } else {
      redirect("/auth/signin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}