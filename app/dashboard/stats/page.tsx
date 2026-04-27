// app/dashboard/stats/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import StatsClient from "@/components/StatsClient";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/restaurant/simple-stats`, {
    cache: "no-store",
    headers: {
      cookie: `next-auth.session-token=${session.user.id}`,
    },
  });
  const data = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Statistiques simplifiées</h1>
      <p className="text-gray-400 mb-6">Aperçu rapide de votre activité</p>
      <StatsClient data={data} />
    </div>
  );
}