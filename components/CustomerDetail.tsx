// components/CustomerDetail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
}

interface Visit {
  id: string;
  date: Date;
  amount: number | null;
  pointsEarned: number;
}

interface EarnedReward {
  reward: Reward;
  earnedAt: Date;
  usedAt: Date | null;
}

interface Customer {
  id: string;
  name: string;
  customerId: string;
  points: number;
  createdAt: Date;
  lastVisit: Date | null;
}

interface Props {
  customer: Customer;
  visits: Visit[];
  earnedRewards: EarnedReward[];
  rewards: Reward[];
  nextReward: Reward | null;
  progress: number;
}

export default function CustomerDetail({
  customer,
  visits: initialVisits,
  earnedRewards,
  rewards,
  nextReward,
  progress,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Local visits state for optimistic UI
  const [visits, setVisits] = useState<Visit[]>(initialVisits);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Montant invalide");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`${data.pointsAdded} points ajoutés !`);
        setTimeout(() => router.refresh(), 1000);
      } else {
        setMessage(data.error || "Erreur");
      }
    } catch {
      setMessage("Erreur de connexion");
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  // --- EDIT VISIT ---
  const startEdit = (visit: Visit) => {
    setEditingId(visit.id);
    setEditAmount(visit.amount?.toString() ?? "");
    setEditMessage(null);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditMessage(null);
  };

  const handleEditSave = async (visitId: string) => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      setEditMessage({ id: visitId, text: "Montant invalide", ok: false });
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/customer/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: newAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistic update
        setVisits((prev) =>
          prev.map((v) =>
            v.id === visitId
              ? { ...v, amount: newAmount, pointsEarned: data.pointsEarned ?? Math.floor(newAmount * 10) }
              : v
          )
        );
        setEditMessage({ id: visitId, text: "Modifié ✓", ok: true });
        setTimeout(() => {
          setEditingId(null);
          setEditMessage(null);
          router.refresh();
        }, 800);
      } else {
        setEditMessage({ id: visitId, text: data.error || "Erreur", ok: false });
      }
    } catch {
      setEditMessage({ id: visitId, text: "Erreur de connexion", ok: false });
    } finally {
      setEditLoading(false);
    }
  };

  // --- DELETE VISIT ---
  const handleDelete = async (visitId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/customer/visits/${visitId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Optimistic remove
        setVisits((prev) => prev.filter((v) => v.id !== visitId));
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setDeleteLoading(false);
    }
  };

  const shortId = customer.customerId.slice(-4);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-[#fe5502] mb-4 hover:underline">
        ← Retour
      </button>

      {/* Customer Info */}
      <div className="bg-[#0d1f3c] rounded-lg p-6 border border-[#1e3a5f] mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Détails de la carte</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Client</p>
            <p className="text-white text-lg font-semibold">{customer.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">ID client</p>
            <p className="text-white font-mono">#{shortId}</p>
            <p className="text-gray-500 text-xs">{customer.customerId}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Carte créée</p>
            <p className="text-white">{new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Dernière visite</p>
            <p className="text-white">
              {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "Jamais"}
            </p>
          </div>
        </div>
      </div>

      {/* Points Wallet */}
      <div className="bg-[#0d1f3c] rounded-lg p-6 border border-[#1e3a5f] mb-6">
        <h2 className="text-xl font-semibold text-white mb-3">Portefeuille ⭐</h2>
        <p className="text-3xl font-bold text-[#fe5502]">{customer.points} points</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Prochaine récompense</span>
            {nextReward && (
              <span>
                {customer.points} / {nextReward.pointsRequired} pts
              </span>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-[#fe5502] h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {nextReward && <p className="text-sm text-gray-400 mt-2">🎁 {nextReward.name}</p>}
        </div>
      </div>

      {/* Add Points */}
      <div className="bg-[#0d1f3c] rounded-lg p-6 border border-[#1e3a5f] mb-6">
        <h2 className="text-xl font-semibold text-white mb-3">Ajouter des points</h2>
        <form onSubmit={handleAddPoints} className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant dépensé (DT)"
            className="flex-1 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] disabled:opacity-50"
          >
            {loading ? "..." : "Ajouter"}
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-green-400">{message}</p>}
        <p className="text-xs text-gray-500 mt-2">1 DT = 10 ⭐</p>
      </div>

      {/* Visit History with CRUD */}
      <div className="bg-[#0d1f3c] rounded-lg p-6 border border-[#1e3a5f] mb-6">
        <h2 className="text-xl font-semibold text-white mb-3">Historique des points</h2>
        {visits.length === 0 ? (
          <p className="text-gray-400">Aucune activité</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-[#1e3a5f]">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Montant (DT)</th>
                  <th className="text-left py-2">Points gagnés</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id} className="border-b border-[#1e3a5f]/50">
                    {/* Date */}
                    <td className="py-2 text-white">
                      {new Date(visit.date).toLocaleDateString()}
                    </td>

                    {/* Amount — editable inline */}
                    <td className="py-2">
                      {editingId === visit.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-24 px-2 py-1 bg-[#0a1628] border border-[#fe5502] rounded text-white text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="text-white">{visit.amount?.toFixed(2) ?? "-"}</span>
                      )}
                    </td>

                    {/* Points */}
                    <td className="py-2 text-[#fe5502]">{visit.pointsEarned}⭐</td>

                    {/* Action buttons */}
                    <td className="py-2 text-right">
                      {confirmDeleteId === visit.id ? (
                        /* Delete confirmation */
                        <span className="inline-flex items-center gap-2">
                          <span className="text-red-400 text-xs">Supprimer ?</span>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            disabled={deleteLoading}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs disabled:opacity-50"
                          >
                            {deleteLoading ? "..." : "Oui"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                          >
                            Non
                          </button>
                        </span>
                      ) : editingId === visit.id ? (
                        /* Save / Cancel edit */
                        <span className="inline-flex items-center gap-2">
                          {editMessage?.id === visit.id && (
                            <span
                              className={`text-xs ${editMessage.ok ? "text-green-400" : "text-red-400"}`}
                            >
                              {editMessage.text}
                            </span>
                          )}
                          <button
                            onClick={() => handleEditSave(visit.id)}
                            disabled={editLoading}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs disabled:opacity-50"
                          >
                            {editLoading ? "..." : "Enregistrer"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                          >
                            Annuler
                          </button>
                        </span>
                      ) : (
                        /* Default edit + delete buttons */
                        <span className="inline-flex items-center gap-2">
                          <button
                            onClick={() => startEdit(visit)}
                            title="Modifier"
                            className="px-2 py-1 bg-[#1e3a5f] hover:bg-[#2a4f7c] text-white rounded text-xs transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(visit.id);
                              setEditingId(null);
                            }}
                            title="Supprimer"
                            className="px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 rounded text-xs transition-colors"
                          >
                            🗑️ Supprimer
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Earned Rewards */}
      {earnedRewards.length > 0 && (
        <div className="bg-[#0d1f3c] rounded-lg p-6 border border-[#1e3a5f]">
          <h2 className="text-xl font-semibold text-white mb-3">Récompenses échangées</h2>
          <ul className="space-y-2">
            {earnedRewards.map((er) => (
              <li key={er.reward.id} className="flex justify-between text-sm">
                <span className="text-white">{er.reward.name}</span>
                <span className="text-gray-400">{new Date(er.earnedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}