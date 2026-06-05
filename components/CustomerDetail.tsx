// components/CustomerDetail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// --- SVG Icon Components (pro, inline) ---
const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const GiftIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HashIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const PencilIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ArrowLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertTriangleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PlusCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

// --- Types ---
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

interface LoyaltyRule {
  spendThreshold: number;
  pointsEarned: number;
}

interface Props {
  customer: Customer;
  visits: Visit[];
  earnedRewards: EarnedReward[];
  rewards: Reward[];
  nextReward: Reward | null;
  progress: number;
  loyaltyRule?: LoyaltyRule; // passed from parent (fetched from /api/loyalty-program)
}

export default function CustomerDetail({
  customer,
  visits: initialVisits,
  earnedRewards,
  rewards,
  nextReward,
  progress,
  loyaltyRule = { spendThreshold: 1, pointsEarned: 10 },
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dynamic points preview based on loyalty rule
  const previewAmount = parseFloat(amount) || 0;
  const previewPoints =
    previewAmount > 0 && loyaltyRule.spendThreshold > 0
      ? Math.floor((previewAmount / loyaltyRule.spendThreshold) * loyaltyRule.pointsEarned)
      : 0;

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ text: "Montant invalide", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);
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
        setMessage({ text: `+${data.pointsAdded} points ajoutés avec succès`, ok: true });
        setTimeout(() => router.refresh(), 1200);
      } else {
        setMessage({ text: data.error || "Erreur", ok: false });
      }
    } catch {
      setMessage({ text: "Erreur de connexion", ok: false });
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

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
        setVisits((prev) =>
          prev.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  amount: newAmount,
                  pointsEarned:
                    data.pointsEarned ??
                    Math.floor((newAmount / loyaltyRule.spendThreshold) * loyaltyRule.pointsEarned),
                }
              : v
          )
        );
        setEditMessage({ id: visitId, text: "Modifié avec succès", ok: true });
        setTimeout(() => {
          setEditingId(null);
          setEditMessage(null);
          router.refresh();
        }, 900);
      } else {
        setEditMessage({ id: visitId, text: data.error || "Erreur", ok: false });
      }
    } catch {
      setEditMessage({ id: visitId, text: "Erreur de connexion", ok: false });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (visitId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/customer/visits/${visitId}`, {
        method: "DELETE",
      });
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

  const shortId = customer.customerId.slice(-4);

  return (
    <div className="min-h-screen bg-[#2e283d] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#fe5502] transition-colors mb-6 group"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Retour
        </button>

        {/* ── Customer Info Card ── */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#091529] border border-[#1e3a5f]/60 p-6 mb-5 shadow-xl shadow-black/30">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#fe5502]/70 uppercase mb-1">Fiche client</p>
              <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#fe5502]/10 border border-[#fe5502]/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-[#fe5502]" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <HashIcon className="w-4 h-4" />,
                label: "ID client",
                value: `#${shortId}`,
                sub: customer.customerId.slice(-8),
              },
              {
                icon: <CalendarIcon className="w-4 h-4" />,
                label: "Carte créée",
                value: new Date(customer.createdAt).toLocaleDateString("fr-FR"),
                sub: null,
              },
              {
                icon: <CalendarIcon className="w-4 h-4" />,
                label: "Dernière visite",
                value: customer.lastVisit
                  ? new Date(customer.lastVisit).toLocaleDateString("fr-FR")
                  : "—",
                sub: null,
              },
              {
                icon: <StarIcon className="w-4 h-4" />,
                label: "Solde actuel",
                value: `${customer.points} pts`,
                sub: null,
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#0a1628]/60 rounded-xl p-3 border border-[#1e3a5f]/40">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                <p className="text-white font-semibold text-sm">{item.value}</p>
                {item.sub && <p className="text-gray-600 text-xs font-mono mt-0.5 truncate">{item.sub}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Points Wallet ── */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#091529] border border-[#1e3a5f]/60 p-6 mb-5 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white tracking-tight">Portefeuille de points</h2>
            <StarIcon className="w-5 h-5 text-[#fe5502]" />
          </div>

          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-bold text-white tabular-nums">{customer.points}</span>
            <span className="text-lg text-[#fe5502] font-semibold mb-1">pts</span>
          </div>

          {nextReward && (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progression vers la prochaine récompense</span>
                <span className="text-gray-400 font-medium">
                  {customer.points} / {nextReward.pointsRequired} pts
                </span>
              </div>
              <div className="w-full bg-[#0a1628] rounded-full h-2 border border-[#1e3a5f]/40 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#fe5502] to-[#ff7a3d] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                <GiftIcon className="w-4 h-4 text-[#fe5502] shrink-0" />
                <span>{nextReward.name}</span>
                <span className="ml-auto text-xs text-gray-600">
                  encore {nextReward.pointsRequired - customer.points} pts
                </span>
              </div>
            </>
          )}

          {!nextReward && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <GiftIcon className="w-4 h-4 shrink-0" />
              <span>Aucune récompense disponible pour le moment</span>
            </div>
          )}
        </div>

        {/* ── Add Points ── */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#091529] border border-[#1e3a5f]/60 p-6 mb-5 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white tracking-tight">Enregistrer une addition</h2>
            <PlusCircleIcon className="w-5 h-5 text-[#fe5502]" />
          </div>

          <form onSubmit={handleAddPoints} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wide uppercase">
                Montant de l'addition (DT)
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setMessage(null);
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#fe5502]/60 focus:ring-1 focus:ring-[#fe5502]/20 transition-all text-sm"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">DT</span>
                </div>
                <button
                  type="submit"
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                  className="px-5 py-2.5 bg-[#fe5502] hover:bg-[#e04d02] disabled:bg-[#fe5502]/30 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-lg shadow-[#fe5502]/20 hover:shadow-[#fe5502]/30"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calcul...
                    </span>
                  ) : (
                    "Valider"
                  )}
                </button>
              </div>
            </div>

            {/* Live points preview */}
            <div className={`rounded-xl border p-3.5 transition-all duration-200 ${
              previewPoints > 0
                ? "bg-[#fe5502]/5 border-[#fe5502]/20"
                : "bg-[#0a1628]/40 border-[#1e3a5f]/40"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <StarIcon className="w-3.5 h-3.5 text-gray-600" />
                  <span>Points générés</span>
                </div>
                <span className={`text-lg font-bold tabular-nums transition-all ${
                  previewPoints > 0 ? "text-[#fe5502]" : "text-gray-600"
                }`}>
                  {previewPoints > 0 ? `+${previewPoints}` : "—"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                Règle : {loyaltyRule.pointsEarned} pts par tranche de {loyaltyRule.spendThreshold} DT
              </p>
            </div>

            {/* Feedback message */}
            {message && (
              <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                message.ok
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {message.ok ? <CheckIcon className="w-4 h-4 shrink-0" /> : <AlertTriangleIcon className="w-4 h-4 shrink-0" />}
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* ── Visit History ── */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#091529] border border-[#1e3a5f]/60 p-6 mb-5 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white tracking-tight">Historique des visites</h2>
            <span className="text-xs text-gray-500 bg-[#0a1628] border border-[#1e3a5f]/40 px-2.5 py-1 rounded-full">
              {visits.length} entrée{visits.length !== 1 ? "s" : ""}
            </span>
          </div>

          {visits.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <CalendarIcon className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune activité enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-[#1e3a5f]/40">
                    <th className="text-left py-2.5 px-1 font-medium">Date</th>
                    <th className="text-left py-2.5 px-1 font-medium">Montant</th>
                    <th className="text-left py-2.5 px-1 font-medium">Points</th>
                    <th className="text-right py-2.5 px-1 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a5f]/25">
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-[#0a1628]/40 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-1 text-gray-300 text-xs">
                        {new Date(visit.date).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-1">
                        {editingId === visit.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-24 px-2 py-1.5 bg-[#0a1628] border border-[#fe5502]/50 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#fe5502]/30"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {visit.amount != null ? `${visit.amount.toFixed(2)} DT` : "—"}
                          </span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-3 px-1">
                        <span className="inline-flex items-center gap-1 text-[#fe5502] font-semibold text-xs">
                          <StarIcon className="w-3 h-3" />
                          {visit.pointsEarned}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-1 text-right">
                        {confirmDeleteId === visit.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-red-400 text-xs mr-1">Confirmer ?</span>
                            <button
                              onClick={() => handleDelete(visit.id)}
                              disabled={deleteLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                            >
                              {deleteLoading ? (
                                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <CheckIcon className="w-3 h-3" />
                              )}
                              Oui
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1e3a5f]/60 hover:bg-[#1e3a5f] text-gray-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XIcon className="w-3 h-3" />
                              Non
                            </button>
                          </span>
                        ) : editingId === visit.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            {editMessage?.id === visit.id && (
                              <span className={`text-xs mr-1 ${editMessage.ok ? "text-emerald-400" : "text-red-400"}`}>
                                {editMessage.text}
                              </span>
                            )}
                            <button
                              onClick={() => handleEditSave(visit.id)}
                              disabled={editLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                            >
                              {editLoading ? (
                                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <CheckIcon className="w-3 h-3" />
                              )}
                              Enregistrer
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1e3a5f]/60 hover:bg-[#1e3a5f] text-gray-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XIcon className="w-3 h-3" />
                              Annuler
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                          <button
  onClick={() => startEdit(visit)}
  title="Modifier"
  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 bg-[#1e3a5f]/30 text-white hover:bg-[#fe5502] hover:text-white border border-transparent hover:border-[#fe5502] focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50"
>
  <PencilIcon className="w-3.5 h-3.5" />
  Modifier
</button>

<button
  onClick={() => {
    setConfirmDeleteId(visit.id);
    setEditingId(null);
  }}
  title="Supprimer"
  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
>
  <TrashIcon className="w-3.5 h-3.5" />
  Supprimer
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

        {/* ── Earned Rewards ── */}
        {earnedRewards.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#091529] border border-[#1e3a5f]/60 p-6 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white tracking-tight">Récompenses échangées</h2>
              <GiftIcon className="w-5 h-5 text-[#fe5502]" />
            </div>
            <ul className="space-y-2">
              {earnedRewards.map((er, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0a1628]/60 border border-[#1e3a5f]/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#fe5502]/10 border border-[#fe5502]/20 flex items-center justify-center shrink-0">
                      <GiftIcon className="w-3 h-3 text-[#fe5502]" />
                    </div>
                    <span className="text-white text-sm font-medium">{er.reward.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(er.earnedAt).toLocaleDateString("fr-FR")}</p>
                    {er.usedAt && (
                      <p className="text-xs text-emerald-500/70">Utilisé</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}