"use client";

import {
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
  totalCustomers: number;
  totalPoints: number;
  totalVisits: number;
  weeklyGrowth: { date: string; count: number }[];
}

export default function StatsClient({ data }: { data: StatsData }) {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Customer Growth Chart (last 7 days) */}
      <div className="bg-[#0d1f3c] p-4 rounded-lg border border-[#1e3a5f]">
        <h2 className="text-lg font-semibold text-white mb-4">Évolution des clients (7 derniers jours)</h2>
        {data.weeklyGrowth.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weeklyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#0d1f3c", borderColor: "#1e3a5f" }} />
              <Legend />
              <Bar dataKey="count" fill="#fe5502" name="Nouveaux clients" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}