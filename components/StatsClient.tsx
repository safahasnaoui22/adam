"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StatsData {
  customerGrowth: { date: string; count: number }[];
  pointsPerDay: { date: string; points: number }[];
  rewardsPerDay: { date: string; count: number }[];
  totalCustomers: number;
  totalPoints: number;
  totalVisits: number;
  totalRewardsRedeemed: number;
}

export default function StatsClient({ data }: { data: StatsData }) {
  // Ensure data arrays exist (fallback to empty)
  const customerGrowth = data.customerGrowth || [];
  const pointsPerDay = data.pointsPerDay || [];
  const rewardsPerDay = data.rewardsPerDay || [];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
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

      {/* Customer Growth Chart */}
      <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
        <h2 className="text-lg font-semibold text-white mb-4">Évolution du nombre de clients</h2>
        {customerGrowth.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f" }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#fe5502" name="Clients" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Points Added Per Day */}
      <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
        <h2 className="text-lg font-semibold text-white mb-4">Points ajoutés par jour</h2>
        {pointsPerDay.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pointsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f" }} />
              <Legend />
              <Bar dataKey="points" fill="#fe5502" name="Points" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Rewards Redeemed Per Day */}
      <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
        <h2 className="text-lg font-semibold text-white mb-4">Récompenses échangées par jour</h2>
        {rewardsPerDay.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rewardsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f" }} />
              <Legend />
              <Bar dataKey="count" fill="#e0682e" name="Récompenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}