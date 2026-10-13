// app/[restaurantSlug]/dashboard/page.tsx
//
// This route used to render the old "Mon programme" screen. The real customer
// dashboard is /client/dashboard, so anything that still points here (old
// installed apps, bookmarks, shared links) is forwarded to it.
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default async function CustomerDashboardRedirect({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
    select: { id: true },
  });
  if (!restaurant) notFound();

  redirect(`/client/dashboard?restaurantId=${restaurant.id}`);
}