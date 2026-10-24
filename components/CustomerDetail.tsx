// components/CustomerDetail.tsx
"use client";

import { useState, useEffect } from "react";
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

const MinusCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const LockIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowUpRightIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// --- Types ---
interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string | null;
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
  loyaltyRule?: LoyaltyRule; // optional initial value; component will fetch live
}

export default function CustomerDetail({
  customer,
  visits: initialVisits,
  earnedRewards,
  rewards,
  nextReward,
  progress,
  loyaltyRule: initialLoyaltyRule,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [points, setPoints] = useState(customer.points);

  // ── Live loyalty rule state (fetched from /api/loyalty-program) ──
  const [loyaltyRule, setLoyaltyRule] = useState<LoyaltyRule>(
    initialLoyaltyRule ?? { spendThreshold: 1, pointsEarned: 10 }
  );
  const [loyaltyRuleLoading, setLoyaltyRuleLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyRule = async () => {
      try {
        const res = await fetch("/api/loyalty-program");
        if (res.ok) {
          const data = await res.json();
          // Support both { spendThreshold, pointsEarned } directly
          // and { program: { spendThreshold, pointsEarned } } wrapper shapes
          const rule = data?.program ?? data;
          if (
            typeof rule?.spendThreshold === "number" &&
            typeof rule?.pointsEarned === "number" &&
            rule.spendThreshold > 0
          ) {
            setLoyaltyRule({
              spendThreshold: rule.spendThreshold,
              pointsEarned: rule.pointsEarned,
            });
          }
        }
      } catch {
        // silently fall back to prop/default value already in state
      } finally {
        setLoyaltyRuleLoading(false);
      }
    };

    fetchLoyaltyRule();
  }, []);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Use points state
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Available rewards state
  const [rewardLoadingId, setRewardLoadingId] = useState<string | null>(null);
  const [rewardMessage, setRewardMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Dynamic points preview based on live loyalty rule
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
        if (typeof data.newPoints === "number") setPoints(data.newPoints);
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

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(redeemAmount);
    if (isNaN(val) || val <= 0) {
      setRedeemMessage({ text: "Nombre de points invalide", ok: false });
      return;
    }
    if (val > points) {
      setRedeemMessage({ text: "Points insuffisants", ok: false });
      return;
    }
    setRedeemLoading(true);
    setRedeemMessage(null);
    try {
      const res = await fetch("/api/customer/deduct-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, pointsToDeduct: val }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setRedeemMessage({ text: `-${data.deducted} pts déduits avec succès`, ok: true });
        setRedeemAmount("");
        setTimeout(() => router.refresh(), 1200);
      } else {
        setRedeemMessage({ text: data.error || "Erreur", ok: false });
      }
    } catch {
      setRedeemMessage({ text: "Erreur de connexion", ok: false });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (points < pointsRequired) return;
    setRewardLoadingId(rewardId);
    setRewardMessage(null);
    try {
      const res = await fetch("/api/customer/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setRewardMessage({ text: "Récompense échangée avec succès", ok: true });
        setTimeout(() => router.refresh(), 1200);
      } else {
        setRewardMessage({ text: data.error || "Erreur", ok: false });
      }
    } catch {
      setRewardMessage({ text: "Erreur de connexion", ok: false });
    } finally {
      setRewardLoadingId(null);
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

  // ── Derived display values (read-only, no behaviour change) ──
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
  const tier = points === 0 ? "Nouveau" : points > 500 ? "VIP" : "Actif";
  const totalSpent = visits.reduce((s, v) => s + (v.amount ?? 0), 0);
  const [historyTab, setHistoryTab] = useState<"visits" | "earned">("visits");

  // ── Delete the whole customer ──
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState(false);
  const [deleteCustomerLoading, setDeleteCustomerLoading] = useState(false);
  const [deleteCustomerError, setDeleteCustomerError] = useState("");

  const handleDeleteCustomer = async () => {
    setDeleteCustomerLoading(true);
    setDeleteCustomerError("");
    try {
      const res = await fetch(`/api/customer/delete/${customer.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/dashboard/clients");
        router.refresh();
      } else {
        setDeleteCustomerError(data.error || "Erreur lors de la suppression");
      }
    } catch {
      setDeleteCustomerError("Erreur de connexion");
    } finally {
      setDeleteCustomerLoading(false);
    }
  };

  // ── Luxury design tokens ──
  const card =
    "relative rounded-3xl border border-[#d4af6a]/15 bg-gradient-to-br from-[#1d1830] via-[#171326] to-[#120f1e] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]";
  const serif = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" } as const;
  const input =
    "w-full px-4 py-2.5 bg-[#0e0b17] border border-[#d4af6a]/15 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af6a]/60 focus:ring-1 focus:ring-[#d4af6a]/20 transition-all text-sm";
  const label = "block text-[10px] font-semibold text-[#d4af6a]/70 mb-1.5 tracking-[0.18em] uppercase";
  const cardTitle = "text-sm font-semibold text-white tracking-wide";
  const iconBox =
    "w-8 h-8 rounded-xl bg-[#d4af6a]/10 border border-[#d4af6a]/25 flex items-center justify-center text-[#d4af6a]";

  const tierStyle =
    tier === "VIP"
      ? "bg-[#d4af6a]/15 text-[#e8cb8d] border-[#d4af6a]/40"
      : tier === "Actif"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
      : "bg-white/5 text-gray-300 border-white/15";

  const Feedback = ({ m }: { m: { text: string; ok: boolean } }) => (
    <div
      className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2 ${
        m.ok
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {m.ok ? <CheckIcon className="w-4 h-4 shrink-0" /> : <AlertTriangleIcon className="w-4 h-4 shrink-0" />}
      {m.text}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#d4af6a] transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Retour
        </button>
        <button
          onClick={() => {
            setDeleteCustomerError("");
            setConfirmDeleteCustomer(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400/90 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Supprimer ce client
        </button>
      </div>

      {/* ── Hero: identity + balance ── */}
      <div className={`${card} overflow-hidden p-6 md:p-7 mb-5`}>
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#d4af6a]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 w-72 h-72 rounded-full bg-[#fe5502]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af6a]/60 to-transparent" />

        <div className="relative grid md:grid-cols-12 gap-6 items-center">
          {/* Identity */}
          <div className="md:col-span-7 flex items-center gap-5 min-w-0">
            <div className="shrink-0 w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-[#f3dba3] via-[#d4af6a] to-[#8a6a2f]">
              <div className="w-full h-full rounded-full bg-[#171326] flex items-center justify-center">
                <span className="text-2xl text-[#e8cb8d]" style={serif}>{initials}</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="text-[10px] font-semibold tracking-[0.25em] text-[#d4af6a]/70 uppercase">Fiche client</p>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${tierStyle}`}>
                  {tier}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white truncate mt-1" style={serif}>
                {customer.name}
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5" title={customer.customerId}>
                  <HashIcon className="w-3.5 h-3.5 text-[#d4af6a]/70" />
                  <span className="text-gray-200 font-medium">#{shortId}</span>
                  <span className="font-mono text-gray-600">{customer.customerId.slice(-8)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#d4af6a]/70" />
                  Carte créée le <span className="text-gray-200 font-medium">{new Date(customer.createdAt).toLocaleDateString("fr-FR")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#d4af6a]/70" />
                  Dernière visite <span className="text-gray-200 font-medium">
                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="md:col-span-5 md:border-l md:border-[#d4af6a]/15 md:pl-6">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#d4af6a]/70 uppercase">Solde actuel</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-5xl font-semibold tabular-nums bg-gradient-to-br from-[#f6e2ad] via-[#d4af6a] to-[#b8863b] bg-clip-text text-transparent"
                style={serif}
              >
                {points}
              </span>
              <span className="text-xs text-gray-500 tracking-[0.2em] uppercase">points</span>
            </div>

            {nextReward ? (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <GiftIcon className="w-3.5 h-3.5 text-[#d4af6a] shrink-0" />
                    <span className="truncate">{nextReward.name}</span>
                  </span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    {points} / {nextReward.pointsRequired} · encore {Math.max(nextReward.pointsRequired - points, 0)} pts
                  </span>
                </div>
                <div className="w-full bg-[#0e0b17] rounded-full h-1.5 border border-[#d4af6a]/10 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#b8863b] via-[#d4af6a] to-[#f6e2ad] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <GiftIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Aucune récompense disponible pour le moment</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini stats */}
        <div className="relative grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#d4af6a]/10">
          {[
            { k: "Visites", v: String(visits.length) },
            { k: "Total dépensé", v: `${totalSpent.toFixed(2)} DT` },
            { k: "Récompenses échangées", v: String(earnedRewards.length) },
          ].map((s) => (
            <div key={s.k} className="text-center">
              <p className="text-lg md:text-xl font-semibold text-white tabular-nums" style={serif}>{s.v}</p>
              <p className="text-[10px] tracking-[0.18em] uppercase text-gray-500 mt-0.5">{s.k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two columns ── */}
      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: actions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Add Points */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={iconBox}><PlusCircleIcon className="w-4 h-4" /></div>
              <h2 className={cardTitle}>Enregistrer une addition</h2>
            </div>

            <form onSubmit={handleAddPoints} className="space-y-3.5">
              <div>
                <label className={label}>Montant de l'addition (DT)</label>
                <div className="flex gap-2.5">
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
                      className={input}
                      disabled={loading}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">DT</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#fe5502] to-[#ff7a3d] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#fe5502]/20"
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

              {/* Live preview + connected loyalty rule */}
              <div
                className={`rounded-2xl border p-3 transition-all duration-200 ${
                  previewPoints > 0 ? "bg-[#d4af6a]/5 border-[#d4af6a]/30" : "bg-[#0e0b17]/60 border-[#d4af6a]/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <StarIcon className="w-3.5 h-3.5 text-gray-600" />
                    <span>Points générés</span>
                  </div>
                  <span className={`text-lg font-bold tabular-nums ${previewPoints > 0 ? "text-[#e8cb8d]" : "text-gray-600"}`}>
                    {loyaltyRuleLoading ? (
                      <span className="w-4 h-4 border-2 border-gray-600/40 border-t-gray-500 rounded-full animate-spin inline-block" />
                    ) : previewPoints > 0 ? (
                      `+${previewPoints}`
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 mt-2 pt-2 border-t border-[#d4af6a]/10">
                  <p className="text-[11px] text-gray-600">
                    {loyaltyRuleLoading ? (
                      "Chargement de la règle..."
                    ) : (
                      <>
                        <span className="text-gray-500">Règle :</span> chaque {loyaltyRule.spendThreshold} DT → {loyaltyRule.pointsEarned} pts
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/loyalty-program")}
                    className="inline-flex items-center gap-1 text-[11px] text-[#d4af6a]/80 hover:text-[#d4af6a] font-medium transition-colors shrink-0"
                  >
                    Configurer
                    <ArrowUpRightIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {message && <Feedback m={message} />}
            </form>
          </div>

          {/* Use Points */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={iconBox}><MinusCircleIcon className="w-4 h-4" /></div>
                <h2 className={cardTitle}>Utiliser des points</h2>
              </div>
              <span className="text-[11px] text-gray-400 bg-[#0e0b17] border border-[#d4af6a]/15 px-2.5 py-1 rounded-full">
                Solde : {points} pts
              </span>
            </div>

            <form onSubmit={handleRedeemPoints} className="space-y-3.5">
              <div>
                <label className={label}>Points à déduire</label>
                <div className="flex gap-2.5">
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={redeemAmount}
                    onChange={(e) => {
                      setRedeemAmount(e.target.value);
                      setRedeemMessage(null);
                    }}
                    placeholder="Ex : 100"
                    className={`flex-1 ${input}`}
                    disabled={redeemLoading}
                  />
                  <button
                    type="submit"
                    disabled={redeemLoading || !redeemAmount || parseInt(redeemAmount) <= 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d4af6a] to-[#b8863b] hover:brightness-110 disabled:opacity-35 disabled:cursor-not-allowed text-[#1a1408] rounded-xl text-sm font-semibold transition-all"
                  >
                    {redeemLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                        ...
                      </span>
                    ) : (
                      "Déduire"
                    )}
                  </button>
                </div>
              </div>
              {redeemMessage && <Feedback m={redeemMessage} />}
            </form>
          </div>
        </div>

        {/* RIGHT: rewards + history */}
        <div className="lg:col-span-7 space-y-5">
          {/* Available Rewards */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={iconBox}><GiftIcon className="w-4 h-4" /></div>
                <h2 className={cardTitle}>Récompenses disponibles</h2>
              </div>
              {rewards.length > 0 && (
                <span className="text-[11px] text-gray-400 bg-[#0e0b17] border border-[#d4af6a]/15 px-2.5 py-1 rounded-full">
                  {rewards.length} récompense{rewards.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {rewardMessage && <div className="mb-3"><Feedback m={rewardMessage} /></div>}

            {rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <GiftIcon className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune récompense configurée</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[17rem] overflow-y-auto pr-1">
                {rewards.map((reward) => {
                  const isAvailable = points >= reward.pointsRequired;
                  const missing = Math.max(reward.pointsRequired - points, 0);
                  return (
                    <div
                      key={reward.id}
                      className={`flex items-center justify-between gap-4 rounded-2xl border p-3 transition-colors ${
                        isAvailable
                          ? "bg-[#d4af6a]/[0.06] border-[#d4af6a]/30"
                          : "bg-[#0e0b17]/50 border-[#d4af6a]/10"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{reward.name}</p>
                        {reward.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{reward.description}</p>
                        )}
                        <p className="text-xs text-[#d4af6a] font-medium mt-1">{reward.pointsRequired} pts</p>
                      </div>

                      {isAvailable ? (
                        <button
                          onClick={() => handleRedeemReward(reward.id, reward.pointsRequired)}
                          disabled={rewardLoadingId === reward.id}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#fe5502] to-[#ff7a3d] hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all"
                        >
                          {rewardLoadingId === reward.id ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <GiftIcon className="w-3.5 h-3.5" />
                          )}
                          Échanger
                        </button>
                      ) : (
                        <div className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-gray-500 text-xs font-medium">
                          <LockIcon className="w-3.5 h-3.5" />
                          +{missing} pts
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History (tabs) */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="inline-flex p-1 rounded-xl bg-[#0e0b17] border border-[#d4af6a]/15">
                {[
                  { id: "visits" as const, label: "Historique des visites", count: visits.length, icon: <CalendarIcon className="w-3.5 h-3.5" /> },
                  { id: "earned" as const, label: "Récompenses échangées", count: earnedRewards.length, icon: <GiftIcon className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setHistoryTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      historyTab === t.id
                        ? "bg-gradient-to-r from-[#d4af6a] to-[#b8863b] text-[#1a1408] shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                    <span className={`tabular-nums ${historyTab === t.id ? "text-[#1a1408]/70" : "text-gray-600"}`}>{t.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {historyTab === "visits" ? (
              visits.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <CalendarIcon className="w-7 h-7 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune activité enregistrée</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[22rem] -mx-1 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-[#171326]">
                      <tr className="text-[10px] text-[#d4af6a]/70 uppercase tracking-[0.18em] border-b border-[#d4af6a]/15">
                        <th className="text-left py-2.5 px-2 font-semibold">Date</th>
                        <th className="text-left py-2.5 px-2 font-semibold">Montant</th>
                        <th className="text-left py-2.5 px-2 font-semibold">Points</th>
                        <th className="text-right py-2.5 px-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d4af6a]/10">
                      {visits.map((visit) => (
                        <tr key={visit.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-2.5 px-2 text-gray-300 text-xs">
                            {new Date(visit.date).toLocaleDateString("fr-FR")}
                          </td>

                          <td className="py-2.5 px-2">
                            {editingId === visit.id ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-24 px-2 py-1.5 bg-[#0e0b17] border border-[#d4af6a]/50 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af6a]/30"
                                autoFocus
                              />
                            ) : (
                              <span className="text-white font-medium">
                                {visit.amount != null ? `${visit.amount.toFixed(2)} DT` : "—"}
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-2">
                            <span className="inline-flex items-center gap-1 text-[#e8cb8d] font-semibold text-xs">
                              <StarIcon className="w-3 h-3" />
                              {visit.pointsEarned}
                            </span>
                          </td>

                          <td className="py-2.5 px-2 text-right">
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
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs font-medium transition-colors"
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
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <XIcon className="w-3 h-3" />
                                  Annuler
                                </button>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => startEdit(visit)}
                                  title="Modifier"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 text-gray-200 hover:bg-[#d4af6a] hover:text-[#1a1408] focus:outline-none focus:ring-2 focus:ring-[#d4af6a]/50"
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
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
              )
            ) : earnedRewards.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <GiftIcon className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune récompense échangée</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
                {earnedRewards.map((er, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-[#0e0b17]/60 border border-[#d4af6a]/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#d4af6a]/10 border border-[#d4af6a]/25 flex items-center justify-center shrink-0">
                        <GiftIcon className="w-3.5 h-3.5 text-[#d4af6a]" />
                      </div>
                      <span className="text-white text-sm font-medium">{er.reward.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(er.earnedAt).toLocaleDateString("fr-FR")}</p>
                      {er.usedAt && <p className="text-xs text-emerald-500/70">Utilisé</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Delete customer confirmation */}
      {confirmDeleteCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleteCustomerLoading && setConfirmDeleteCustomer(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#1d1830] to-[#120f1e] border border-red-500/30 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white" style={serif}>Supprimer ce client ?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  La carte de <span className="text-white font-medium">{customer.name}</span> ({points} pts) sera
                  supprimée définitivement avec son historique. Cette action est irréversible.
                </p>
              </div>
            </div>
            {deleteCustomerError && (
              <p className="mt-4 text-sm rounded-lg px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20">
                {deleteCustomerError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteCustomer(false)}
                disabled={deleteCustomerLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={deleteCustomerLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-60"
              >
                {deleteCustomerLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
