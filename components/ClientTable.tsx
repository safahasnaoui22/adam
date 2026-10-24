// components/ClientTable.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  name: string;
  customerId: string;
  points: number;
  visits: any[];
  progress: number;
}

const TrashIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const AlertIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ClientTable({ customers: initialCustomers }: { customers: Customer[] }) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/customer/delete/${toDelete.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== toDelete.id));
        setToDelete(null);
        router.refresh();
      } else {
        setError(data.error || "Erreur lors de la suppression");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setDeleting(false);
    }
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
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
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
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => { setError(""); setToDelete(customer); }}
                    title="Supprimer ce client"
                    aria-label={`Supprimer ${customer.name}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-400">Total : {filtered.length} clients</div>

      {/* Delete confirmation */}
      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleting && setToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#091529] border border-red-500/30 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertIcon className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white">Supprimer ce client ?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  La carte de <span className="text-white font-medium">{toDelete.name}</span> ({toDelete.points} pts)
                  sera supprimée définitivement, avec son historique de visites et ses récompenses.
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm rounded-lg px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20">{error}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#1e3a5f]/60 hover:bg-[#1e3a5f] text-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-60"
              >
                {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
