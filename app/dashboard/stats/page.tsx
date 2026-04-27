import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const restaurantId = session.user.restaurantId;

  const totalCustomers = await prisma.customerProfile.count({ where: { restaurantId } });
  const totalPointsAgg = await prisma.customerProfile.aggregate({
    where: { restaurantId },
    _sum: { points: true },
  });
  const totalPoints = totalPointsAgg._sum.points || 0;
  const totalVisits = await prisma.visit.count({ where: { customer: { restaurantId } } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Statistiques</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400">Total clients</p>
          <p className="text-2xl font-bold text-white">{totalCustomers}</p>
        </div>
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400">Points distribués</p>
          <p className="text-2xl font-bold text-white">{totalPoints}⭐</p>
        </div>
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400">Visites</p>
          <p className="text-2xl font-bold text-white">{totalVisits}</p>
        </div>
      </div>
    </div>
  );
}