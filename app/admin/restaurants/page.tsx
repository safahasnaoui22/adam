// app/admin/restaurants/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { AccountStatus, SubscriptionPlan } from "@prisma/client"; // Use AccountStatus instead of RestaurantStatus
import { Suspense } from "react";
import RestaurantTable from "./RestaurantTable";
import RestaurantFilters from "./RestaurantFilters";

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; plan?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const { status, plan } = await searchParams;

  // Build filter conditions
  const where: any = {};
  if (status && Object.values(AccountStatus).includes(status as AccountStatus)) {
    where.accountStatus = status;
  }
  if (plan && Object.values(SubscriptionPlan).includes(plan as SubscriptionPlan)) {
    where.subscription = { plan };
  }

  const restaurants = await prisma.restaurant.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
      subscription: true, // Include subscription to get plan
      loyaltyProgram: {
        select: { id: true },
      },
      _count: {
        select: { customers: true },
      },
    },
  });

  // Transform restaurants to include plan from subscription
  const restaurantsWithPlan = restaurants.map(restaurant => ({
    ...restaurant,
    plan: restaurant.subscription?.plan || "FREE",
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#282424]">
          Gestion des restaurants
        </h1>
        <Suspense fallback={null}>
          <RestaurantFilters />
        </Suspense>
      </div>

      <RestaurantTable restaurants={restaurantsWithPlan} />
    </div>
  );
}