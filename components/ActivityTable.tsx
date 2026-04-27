// components/ActivityTable.tsx
"use client";

import { useState } from "react";

interface Activity {
  id: string;
  action: string;
  details: any;
  createdAt: Date;
  user: { name: string | null; email: string | null };
}

interface Staff {
  id: string;
  name: string | null;
  email: string | null;
}

export default function ActivityTable({ activities, staff }: { activities: Activity[]; staff: Staff[] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  const filtered = activities.filter((activity) => {
    if (startDate && new Date(activity.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(activity.createdAt) > new Date(endDate)) return false;
    if (selectedStaff && activity.user.id !== selectedStaff) return false;
    return true;
  });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Du</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Au</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Membre du personnel</label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white"
          >
            <option value="">Tout le personnel</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#0d1f3c] rounded-lg overflow-hidden">
          <thead className="bg-[#1e3a5f]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Utilisateur</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Action</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e3a5f]">
            {filtered.map((activity) => (
              <tr key={activity.id}>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-white">{activity.user.name || activity.user.email}</td>
                <td className="px-4 py-3 text-sm text-[#fe5502]">{activity.action}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {activity.details ? JSON.stringify(activity.details) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}