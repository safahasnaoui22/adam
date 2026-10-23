// app/client/dashboard/layout.tsx
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { restaurantPwaMetadata } from "../../lib/pwaMetadata";

// The customer's restaurant decides the manifest and the icons, so the app
// installed from this page carries the restaurant's own name and logo.
export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "CUSTOMER") return {};
  // Prefer the live profile (always right), fall back to the slug in the JWT.
  const restaurantId = session.user.customerProfile?.restaurantId;
  if (restaurantId) return restaurantPwaMetadata({ id: restaurantId });
  const slug = session.user.restaurantSlug;
  return slug ? restaurantPwaMetadata({ urlSlug: slug }) : {};
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