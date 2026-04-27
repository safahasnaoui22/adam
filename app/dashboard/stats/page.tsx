import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import StatsClient from "@/components/StatsClient";
const emptyStats = {
  customerGrowth: [],
  pointsPerDay: [],
  rewardsPerDay: [],
  totalCustomers: 0,
  totalPoints: 0,
  totalVisits: 0,
  totalRewardsRedeemed: 0,
};
export const metadata = {
  title: "Statistiques - Adam",
  description: "Analysez les performances de votre programme de fidélité",
};

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  let statsData = null;
  let error = null;

  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://adamrestaurents.vercel.app";
    const res = await fetch(`${baseUrl}/api/restaurant/stats`, {
      cache: "no-store",
      headers: {
        cookie: `next-auth.session-token=${session?.user?.id}`,
      },
    });

    if (!res.ok) {
      error = `Erreur API (${res.status})`;
    } else {
      statsData = await res.json();
    }
  } catch (err) {
    console.error("Stats fetch error:", err);
    error = "Impossible de charger les données";
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Statistiques</h1>
      <p className="text-gray-400 mb-6">
        Analysez l’activité de votre programme de fidélité
      </p>

      {error ? (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e]"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <StatsClient data={statsData || emptyStats} />
      )}
    </div>
  );
}