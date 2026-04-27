"use client";

interface StatsData {
  totalCustomers: number;
  totalPoints: number;
  totalVisits: number;
  totalRewardsRedeemed: number;
}

export default function StatsClient({ data }: { data: StatsData }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400 text-sm">Total clients</p>
          <p className="text-2xl font-bold text-white">{data.totalCustomers}</p>
        </div>
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400 text-sm">Points distribués</p>
          <p className="text-2xl font-bold text-white">{data.totalPoints}⭐</p>
        </div>
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400 text-sm">Visites enregistrées</p>
          <p className="text-2xl font-bold text-white">{data.totalVisits}</p>
        </div>
        <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
          <p className="text-gray-400 text-sm">Récompenses échangées</p>
          <p className="text-2xl font-bold text-white">{data.totalRewardsRedeemed}</p>
        </div>
      </div>
    </div>
  );
}