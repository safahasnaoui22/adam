// components/ClientTable.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

interface Customer {
  id: string;
  name: string;
  customerId: string;
  points: number;
  visits: any[];
  progress: number;
}

export default function ClientTable({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.customerId.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (points: number) => {
    if (points === 0) return "Nouveau";
    if (points > 500) return "VIP";
    return "Actif";
  };

  const getStatusClass = (points: number) => {
    if (points === 0) return "bg-gray-600 text-gray-300";
    if (points > 500) return "bg-yellow-600 text-yellow-200";
    return "bg-green-600 text-green-200";
  };

  const getLastActivity = (customer: Customer) => {
    if (!customer.visits.length) return "Jamais";
    return new Date(customer.visits[0].date).toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#fe5502]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#0d1f3c] rounded-lg overflow-hidden">
          <thead className="bg-[#1e3a5f]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Points</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Progression</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Dernière activité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e3a5f]">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-[#1e3a5f]/50">
                <td className="px-4 py-3 text-sm text-white">
  <Link href={`/dashboard/clients/${customer.id}`} className="hover:text-[#fe5502] transition">
    {customer.name}
  </Link>
</td>
                <td className="px-4 py-3 text-sm text-gray-400">{customer.customerId.slice(-6)}</td>
                <td className="px-4 py-3 text-sm text-[#fe5502]">{customer.points}⭐</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div className="bg-[#fe5502] h-2 rounded-full" style={{ width: `${customer.progress}%` }} />
                    </div>
                    <span>{Math.round(customer.progress)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(customer.points)}`}>
                    {getStatus(customer.points)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{getLastActivity(customer)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-400">Total : {filtered.length} clients</div>
    </div>
  );
}