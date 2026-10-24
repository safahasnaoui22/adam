// app/dashboard/stats/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

import StatsClient from "@/components/StatsClient";
import { getStatsData } from "@/lib/statsData";

const RANGES = [7, 30, 90, 365];

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const { range: raw } = await searchParams;
  const parsed = parseInt(raw || "30", 10);
  const range = RANGES.includes(parsed) ? parsed : 30;

  const data = await getStatsData(session.user.restaurantId, range);
  return <StatsClient data={data} />;
}
