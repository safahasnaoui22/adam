// app/dashboard/stats/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import StatsClient from "@/components/StatsClient";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  let data = null;
  let error = null;

  try {
    // Use absolute URL with NEXTAUTH_URL fallback
    const baseUrl = process.env.NEXTAUTH_URL || "https://adamrestaurents.vercel.app";
    const res = await fetch(`${baseUrl}/api/restaurant/stats`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Stats API error response:", errorText);
      error = `API responded with status ${res.status}`;
    } else {
      data = await res.json();
    }
  } catch (err) {
    console.error("Fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Statistiques</h1>
        <p className="text-gray-400 mb-6">Analysez l’activité de votre programme de fidélité</p>
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-2">Erreur lors du chargement des statistiques</p>
          <p className="text-gray-400 text-sm">Détails : {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e]"
          >
            Réessayer
          </button>
        </div>
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