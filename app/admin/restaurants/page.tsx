// app/admin/restaurants/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

import { RestaurantStatus, PlanType } from "@prisma/client";
import RestaurantTable from "./RestaurantTable";

export default async function AdminRestaurantsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        }
      },
      loyaltyProgram: {
        select: {
          id: true,
        }
      },
      _count: {
        select: {
          customers: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#282424]">Gestion des restaurants</h1>
        <div className="flex space-x-2">
          <select 
            className="px-3 py-2 border border-[#c6c9c8] rounded-md text-sm"
            onChange={(e) => {
              const status = e.target.value;
              // Handle filter
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="ACTIVE">Actif</option>
            <option value="SUSPENDED">Suspendu</option>
          </select>
          <select 
            className="px-3 py-2 border border-[#c6c9c8] rounded-md text-sm"
            onChange={(e) => {
              const plan = e.target.value;
              // Handle filter
            }}
          >
            <option value="">Tous les plans</option>
            <option value="FREE">Gratuit</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
      </div>

      <RestaurantTable restaurants={restaurants} />
    </div>
  );
}