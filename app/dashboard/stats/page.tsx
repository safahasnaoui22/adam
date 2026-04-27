// app/dashboard/stats/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import StatsClient from "@/components/StatsClient";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/restaurant/stats`, {
    cache: "no-store",
  });
  const data = await res.json();

  if (!res.ok) {
    return (
      <div className="p-6 text-center text-red-500">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Statistiques</h1>
      <p className="text-gray-400 mb-6">Analysez l’activité de votre programme de fidélité</p>
      <StatsClient data={data} />
    </div>
  );
}