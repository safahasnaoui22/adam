// app/dashboard/clients/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ClientTable from "@/components/ClientTable";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const customers = await prisma.customerProfile.findMany({
    where: { restaurantId: session.user.restaurantId },
    include: {
      visits: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
    where: { restaurantId: session.user.restaurantId },
    include: { rewards: { orderBy: { pointsRequired: "asc" } } },
  });
  const rewards = loyaltyProgram?.rewards || [];

  const customersWithProgress = customers.map(customer => {
    const nextReward = rewards.find(r => r.pointsRequired > customer.points);
    const progress = nextReward ? (customer.points / nextReward.pointsRequired) * 100 : 100;
    return { ...customer, progress, nextRewardName: nextReward?.name || null };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Cartes de fidélité</h1>
      <p className="text-gray-400 mb-6">Retrouvez ici toutes les cartes de vos clients</p>
      <ClientTable customers={customersWithProgress} />
    </div>
  );
}