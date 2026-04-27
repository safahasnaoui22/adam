// app/dashboard/activities/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ActivityTable from "@/components/ActivityTable";

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const activities = await prisma.activityLog.findMany({
    where: {
      user: {
        restaurant: { id: session.user.restaurantId },
      },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const staff = await prisma.user.findMany({
    where: {
      restaurant: { id: session.user.restaurantId },   // ✅ use relation filter
      role: { in: ["RESTAURANT_OWNER"] },               // you can add "STAFF" if needed
    },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Historique d'activité</h1>
      <p className="text-gray-400 mb-6">Historique complet de toutes les activités du personnel</p>
      <ActivityTable activities={activities} staff={staff} />
    </div>
  );
}