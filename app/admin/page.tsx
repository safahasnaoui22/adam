// app/admin/restaurants/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import RestaurantTable from "./restaurants/RestaurantTable";
import RestaurantFilters from "./restaurants/RestaurantFilters";


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
  if (status) where.accountStatus = status;
  if (plan) where.plan = plan;

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
      loyaltyProgram: {
        select: { id: true },
      },
      _count: {
        select: { customers: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#282424]">
          Gestion des restaurants
        </h1>
        <RestaurantFilters />
      </div>
      <RestaurantTable restaurants={restaurants} />
    </div>
  );
}