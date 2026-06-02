// components/ScanClientForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
}

interface Visit {
  id: string;
  date: Date;
  amount: number | null;
  pointsEarned: number;
}

interface Props {
  customerId: string;
  currentPoints: number;
  rewards: Reward[];
  visits: Visit[];
}

export default function ScanClientForm({
  customerId,
  currentPoints,
  rewards,
  visits: initialVisits,
}: Props) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setMessage({ text: "Montant invalide", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, amount: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `+${data.pointsAdded} points ajoutés !`, ok: true });
        setAmount("");
        setTimeout(() => router.refresh(), 900);
      } else {
        setMessage({ text: data.error || "Erreur", ok: false });
      }
    } catch {
      setMessage({ text: "Erreur de connexion", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (visit: Visit) => {
    setEditingId(visit.id);
    setEditAmount(visit.amount?.toString() ?? "");
    setEditMsg(null);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditMsg(null);
  };

  const handleEditSave = async (visitId: string) => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      setEditMsg({ id: visitId, text: "Montant invalide", ok: false });
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
        setVisits((prev) =>
          prev.map((v) =>
            v.id === visitId
              ? { ...v, amount: newAmount, pointsEarned: data.pointsEarned ?? Math.floor(newAmount * 10) }
              : v
          )
        );
        setEditMsg({ id: visitId, text: "Modifié ✓", ok: true });
        setTimeout(() => { setEditingId(null); setEditMsg(null); router.refresh(); }, 800);
      } else {
        setEditMsg({ id: visitId, text: data.error || "Erreur", ok: false });
      }
    } catch {
      setEditMsg({ id: visitId, text: "Erreur de connexion", ok: false });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (visitId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/customer/visits/${visitId}`, { method: "DELETE" });
      if (res.ok) {
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

  const nextReward = rewards.find((r) => r.pointsRequired > currentPoints) ?? null;
  const progressPct = nextReward
    ? Math.min(100, Math.round((currentPoints / nextReward.pointsRequired) * 100))
    : 100;

  return (
    <div className="space-y-5">

      {/* ── Progress bar ── */}
      {nextReward && (
        <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span className="text-sm font-semibold text-orange-400">{nextReward.name}</span>
            </div>
            <span className="text-xs font-mono text-orange-300/80 bg-orange-500/10 px-2 py-0.5 rounded-full">
              {currentPoints} / {nextReward.pointsRequired}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-orange-300/60 mt-2">{progressPct}% accompli</p>
        </div>
      )}

      {/* ── Add points ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Nouvelle visite
        </p>
        <form onSubmit={handleAddPoints} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500
                         focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all pr-12"
              disabled={loading}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">DT</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white rounded-xl text-sm font-semibold
                       disabled:opacity-40 transition-all duration-150 whitespace-nowrap shadow-lg shadow-orange-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                ...
              </span>
            ) : "Ajouter"}
          </button>
        </form>

        {message && (
          <div className={`mt-2.5 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
            message.ok
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            <span>{message.ok ? "✓" : "⚠"}</span>
            {message.text}
          </div>
        )}
        <p className="text-xs text-gray-600 mt-2">1 DT = 10 ⭐</p>
      </div>

      {/* ── Visit history ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-white/8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Historique des points
          </p>
        </div>

        {visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <span className="text-3xl mb-2">📋</span>
            <p className="text-sm">Aucune activité pour l'instant</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {visits.map((visit) => (
              <div key={visit.id} className="px-4 py-3 hover:bg-white/3 transition-colors">
                {/* Normal row */}
                {editingId !== visit.id && confirmDeleteId !== visit.id && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">
                        {visit.amount != null ? `${visit.amount.toFixed(2)} DT` : "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(visit.date).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        +{visit.pointsEarned} ⭐
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(visit)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-blue-500/15 text-gray-400 hover:text-blue-400 transition-all text-xs"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(visit.id); setEditingId(null); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-all text-xs"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit row */}
                {editingId === visit.id && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-blue-400 font-semibold">Modifier le montant</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2 text-white text-sm
                                     focus:outline-none focus:border-blue-400 transition-all pr-10"
                          autoFocus
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400/60">DT</span>
                      </div>
                      <button
                        onClick={() => handleEditSave(visit.id)}
                        disabled={editLoading}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-all"
                      >
                        {editLoading ? "…" : "Sauvegarder"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-2 bg-white/8 hover:bg-white/12 text-gray-300 rounded-xl text-xs font-semibold transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                    {editMsg?.id === visit.id && (
                      <p className={`text-xs ${editMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                        {editMsg.text}
                      </p>
                    )}
                  </div>
                )}

                {/* Delete confirm row */}
                {confirmDeleteId === visit.id && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚠️</span>
                      <p className="text-sm text-red-300">Supprimer cette entrée ?</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDelete(visit.id)}
                        disabled={deleteLoading}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
                      >
                        {deleteLoading ? "…" : "Confirmer"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 bg-white/8 hover:bg-white/12 text-gray-300 rounded-lg text-xs font-semibold transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Rewards list ── */}
      {rewards.length > 0 && (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-white/8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Récompenses disponibles
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {rewards.map((r) => {
              const unlocked = currentPoints >= r.pointsRequired;
              return (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{unlocked ? "🎁" : "🔒"}</span>
                    <div>
                      <p className={`text-sm font-medium ${unlocked ? "text-white" : "text-gray-400"}`}>
                        {r.name}
                      </p>
                      {r.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                    unlocked
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-white/5 text-gray-500"
                  }`}>
                    {r.pointsRequired} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}