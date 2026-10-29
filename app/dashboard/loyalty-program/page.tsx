"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string | null;
  isActive: boolean;
}

interface LoyaltyProgram {
  id: string;
  spendThreshold: number;
  pointsEarned: number;
  rewards: Reward[];
}

export default function LoyaltyProgramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);

  // Form state
  const [spendThreshold, setSpendThreshold] = useState(1);
  const [pointsEarned, setPointsEarned] = useState(10);
  const [rewards, setRewards] = useState<Reward[]>([]);

  // New reward form
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "",
    pointsRequired: 100,
    description: "",
    isActive: true,
  });
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Quick "Ajouter un Article" form (right-side panel)
  const [articleName, setArticleName] = useState("");
  const [articlePoints, setArticlePoints] = useState("100");

  // ─── Range helpers ───────────────────────────────────────────────────────────
  /**
   * Returns the [min, max] points range for the *next* reward to be added.
   *
   * Rules:
   *  - First reward  → 100 – 300 pts
   *  - Every subsequent reward → (prevMax + 100) – (prevMax + 300)
   *
   * Only ACTIVE rewards are considered — deactivated ("soft-deleted") rewards
   * are excluded so that removing a tier resets the range correctly.
   */
  const getNextPointsRange = (rewardsList: Reward[]): [number, number] => {
    if (rewardsList.length === 0) return [100, 300];
    const active = rewardsList.filter((r) => r.isActive);
    if (active.length === 0) return [100, 300];
    const maxPoints = Math.max(...active.map((r) => r.pointsRequired));
    return [maxPoints + 100, maxPoints + 300];
  };

  /** Clamp a value to [min, max] */
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  useEffect(() => {
    fetchLoyaltyProgram();
  }, []);

  const fetchLoyaltyProgram = async () => {
    try {
      const res = await fetch("/api/loyalty-program");
      const data = await res.json();
      if (res.ok) {
        setProgram(data);
        setSpendThreshold(data.spendThreshold);
        setPointsEarned(data.pointsEarned);
        setRewards(data.rewards);
        // Pre-fill the quick article form with the minimum of the allowed range
        const [firstMin] = getNextPointsRange(
          (data.rewards as Reward[]).filter((r) => r.isActive)
        );
        setArticlePoints(String(firstMin));
      } else {
        alert(data.error || "Failed to load");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load loyalty program");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/loyalty-program", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spendThreshold, pointsEarned }),
      });
      const data = await res.json();
      if (res.ok) {
        toast?.success("Programme mis à jour");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur de mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();

    const [minPts, maxPts] = getNextPointsRange(rewards);

    if (newReward.pointsRequired < minPts || newReward.pointsRequired > maxPts) {
      toast?.error(
        `Les points requis doivent être compris entre ${minPts} et ${maxPts}.`
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReward),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedRewards = [...rewards, data];
        setRewards(updatedRewards);
        setShowRewardForm(false);

        const [nextMin] = getNextPointsRange(updatedRewards);
        setNewReward({
          name: "",
          pointsRequired: nextMin,
          description: "",
          isActive: true,
        });
        toast?.success("Récompense ajoutée");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur");
    } finally {
      setSaving(false);
    }
  };

  // Quick add from the right-side "Ajouter un Article" form.
  // Uses the same API and the same points-range rule as the full reward form.
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = articleName.trim();
    const pts = parseInt(articlePoints, 10);
    if (!name) {
      toast?.error("Veuillez saisir le nom de l'article.");
      return;
    }
    if (!Number.isFinite(pts) || pts <= 0) {
      toast?.error("Veuillez saisir un nombre de points valide.");
      return;
    }

    const [rangeMin, rangeMax] = getNextPointsRange(rewards.filter((r) => r.isActive));
    if (pts < rangeMin || pts > rangeMax) {
      toast?.error(`Les points requis doivent être compris entre ${rangeMin} et ${rangeMax}.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pointsRequired: pts, description: "", isActive: true }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedRewards = [...rewards, data];
        setRewards(updatedRewards);
        setArticleName("");
        const [nextMin] = getNextPointsRange(updatedRewards.filter((r) => r.isActive));
        setArticlePoints(String(nextMin));
        toast?.success("Article ajouté");
      } else {
        toast?.error(data.error || "Erreur");
      }
    } catch (error) {
      console.error(error);
      toast?.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateReward = async (reward: Reward) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/rewards/${reward.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reward),
      });
      const data = await res.json();
      if (res.ok) {
        setRewards(rewards.map((r) => (r.id === reward.id ? data : r)));
        setEditingReward(null);
        toast?.success("Récompense mise à jour");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm("Supprimer cette récompense ?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/rewards/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setRewards(rewards.filter((r) => r.id !== id));
        toast?.success("Récompense supprimée");
      } else if (res.status === 409) {
        const deactivate = confirm(
          "Cette récompense a déjà été utilisée par des clients et ne peut pas être supprimée.\n\n" +
            "Voulez-vous la désactiver à la place ? Elle n'apparaîtra plus pour les nouveaux clients."
        );
        if (deactivate) {
          const reward = rewards.find((r) => r.id === id);
          if (!reward) return;

          const patchRes = await fetch(`/api/rewards/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...reward, isActive: false }),
          });

          if (patchRes.ok) {
            const updated = await patchRes.json();
            setRewards(rewards.map((r) => (r.id === id ? updated : r)));
            toast?.success("Récompense désactivée");
          } else {
            toast?.error("Échec de la désactivation");
          }
        }
      } else {
        toast?.error(data.error || "Échec de la suppression");
      }
    } catch (error) {
      console.error(error);
      toast?.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  // Open the add-reward form, pre-filling with the minimum of the valid range
  const openAddRewardForm = () => {
    const [minPts] = getNextPointsRange(rewards);
    setNewReward({
      name: "",
      pointsRequired: minPts,
      description: "",
      isActive: true,
    });
    setShowRewardForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe5502]"></div>
      </div>
    );
  }

  // ─── Derived range for the "add" form ────────────────────────────────────────
  // Only active rewards count — inactive (soft-deleted) ones are ignored so that
  // "deleting" a tier properly resets the allowed range for the next reward.
  const activeRewards = rewards.filter((r) => r.isActive);
  const [minPts, maxPts] = getNextPointsRange(activeRewards);
  const isFirstReward = activeRewards.length === 0;

  // Purchase value (in DT) a customer must spend to earn `pts` points,
  // based on the current rule: spendThreshold DT → pointsEarned points.
  const purchaseValueDT = (pts: number) => {
    if (!Number.isFinite(pts) || !pointsEarned || pointsEarned <= 0 || !Number.isFinite(spendThreshold)) {
      return "0";
    }
    const v = (pts / pointsEarned) * spendThreshold;
    return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, "");
  };
  const articlePointsNum = parseInt(articlePoints, 10);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">Portefeuille de points</h1>
      <p className="text-gray-400 mb-8">
        Configurez les règles de gain de points et les paliers de récompenses.
      </p>

      {/* How it works */}
      <div className="bg-white/[0.04] rounded-xl shadow p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Comment ça marche</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-[#ffd9b9] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-[#fe5502] text-xl">💰</span>
            </div>
            <p>Le client paie</p>
          </div>
          <div className="text-2xl text-[#fe5502]">→</div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-[#ffd9b9] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-[#fe5502] text-xl">⭐</span>
            </div>
            <p>Points gagnés automatiquement</p>
          </div>
          <div className="text-2xl text-[#fe5502]">→</div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-[#ffd9b9] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-[#fe5502] text-xl">🎁</span>
            </div>
            <p>Échange contre des récompenses</p>
          </div>
        </div>
      </div>

      {/* Conversion rules */}
      <div className="bg-white/[0.04] rounded-xl shadow p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Récompensez les clients avec des points</h2>
        <form onSubmit={handleUpdateProgram} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Palier de dépense *
              </label>
              <input
                type="number"
                step="0.01"
                value={spendThreshold}
                onChange={(e) => setSpendThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-white/10 rounded-md focus:ring-[#fe5502] focus:border-[#fe5502] bg-black/20 text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Montant minimum d'achat pour gagner des points</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Points gagnés *
              </label>
              <input
                type="number"
                value={pointsEarned}
                onChange={(e) => setPointsEarned(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-white/10 rounded-md focus:ring-[#fe5502] focus:border-[#fe5502] bg-black/20 text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Points attribués à chaque palier atteint</p>
            </div>
          </div>
          <div className="bg-black/20 p-4 rounded-md border border-white/10">
            <p className="text-sm text-gray-300">
              <strong>Règle actuelle :</strong> Pour chaque {spendThreshold} DT dépensé → {pointsEarned} point(s) gagné(s)
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      {/* Menu des articles: cards on the left, quick form on the right */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Menu des Récompenses 🎁</h2>
        <p className="text-gray-400 mb-6">
          Gérez vos cadeaux et attirez plus de clients avec des récompenses irrésistibles.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: added articles as cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold tracking-widest text-gray-400 uppercase">
                Votre carte cadeaux
              </h3>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 bg-white/5 border border-[var(--border)] px-3 py-1 rounded-md uppercase">
                Live preview
              </span>
            </div>

            {rewards.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl text-gray-400">
                Aucun article pour le moment. Ajoutez le premier avec le formulaire.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 transition-colors hover:border-[#F97316]/50 ${
                      reward.isActive ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M20 7h-2.18A3 3 0 0 0 12 4.35 3 3 0 0 0 6.18 7H4a1 1 0 0 0-1 1v4h18V8a1 1 0 0 0-1-1ZM9 7a1 1 0 1 1 1 1H9Zm5 1a1 1 0 1 1 1-1v1ZM4 14v5a2 2 0 0 0 2 2h5v-7Zm9 7h5a2 2 0 0 0 2-2v-5h-7Z" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteReward(reward.id)}
                        disabled={saving}
                        title="Supprimer"
                        aria-label={`Supprimer ${reward.name}`}
                        className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <h4 className="text-white font-bold text-lg truncate">{reward.name}</h4>
                      {!reward.isActive && (
                        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full shrink-0">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="mt-1">
                      <span className="text-2xl font-extrabold text-[#F97316]">{reward.pointsRequired}</span>{" "}
                      <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">points</span>
                    </p>
                    <p className="mt-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                      Équivaut à {purchaseValueDT(reward.pointsRequired)} DT d'achat
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: little "Ajouter un Article" form */}
          <form
            onSubmit={handleCreateArticle}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 lg:sticky lg:top-6"
          >
            <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-5">
              <span className="w-5 h-5 rounded-full bg-[#F97316] text-white text-sm leading-none flex items-center justify-center">
                +
              </span>
              Ajouter un Article
            </h3>

            <label htmlFor="article-name" className="block text-xs font-extrabold tracking-widest text-gray-400 uppercase mb-2">
              Nom de l'article
            </label>
            <input
              id="article-name"
              type="text"
              value={articleName}
              onChange={(e) => setArticleName(e.target.value)}
              placeholder="Ex: Article offert, Remise 10%…"
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-[var(--border)] text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
              required
            />

            <label htmlFor="article-points" className="block text-xs font-extrabold tracking-widest text-gray-400 uppercase mt-5 mb-2">
              Combien de points ?
            </label>
            <div className="relative">
              <input
                id="article-points"
                type="number"
                min={minPts}
                max={maxPts}
                step={10}
                value={articlePoints}
                onChange={(e) => setArticlePoints(e.target.value)}
                className="w-full px-4 py-3 pr-14 rounded-xl bg-black/20 border border-[var(--border)] text-[#F97316] font-bold focus:outline-none focus:border-[#F97316]"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold tracking-widest text-gray-400">
                PTS
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Entre {minPts} et {maxPts} pts pour ce prochain article
            </p>

            <p className="text-sm text-gray-400 mt-4">
              Valeur d'achat :{" "}
              <span className="font-semibold text-emerald-400">
                Client dépense {purchaseValueDT(articlePointsNum)} DT
              </span>
            </p>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F97316] to-[#D95B05] hover:brightness-110 disabled:opacity-50 transition"
            >
              {saving ? "Enregistrement..." : "Enregistrer l'Article"}
            </button>
          </form>
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-[#0d1f3c] rounded-xl shadow p-6 border border-[#1e3a5f]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Paliers de récompenses</h2>
          <button
            onClick={openAddRewardForm}
            className="text-sm bg-[#fe5502] text-white px-3 py-1 rounded-md hover:bg-[#e0682e] transition-colors"
          >
            + Ajouter une récompense
          </button>
        </div>

        {showRewardForm && (
          <div className="border border-[#1e3a5f] rounded-lg p-4 mb-6 bg-[#0a1628]">
            <h3 className="font-medium text-white mb-3">Nouvelle récompense</h3>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Nom de la récompense *</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-white"
                  required
                />
              </div>

              {/* ── Points requis with range input ── */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Points requis *
                  <span className="ml-2 font-normal text-[#fe5502]">
                    {newReward.pointsRequired} pts
                  </span>
                </label>

                {/* Slider */}
                <input
                  type="range"
                  min={minPts}
                  max={maxPts}
                  step={10}
                  value={newReward.pointsRequired}
                  onChange={(e) =>
                    setNewReward({
                      ...newReward,
                      pointsRequired: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#fe5502] mb-2"
                />

                {/* Min / max labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{minPts} pts (min)</span>
                  <span>{maxPts} pts (max)</span>
                </div>

                {/* Precise numeric input (clamped on blur) */}
                <input
                  type="number"
                  min={minPts}
                  max={maxPts}
                  step={10}
                  value={newReward.pointsRequired}
                  onChange={(e) =>
                    setNewReward({
                      ...newReward,
                      pointsRequired: parseInt(e.target.value) || minPts,
                    })
                  }
                  onBlur={(e) =>
                    setNewReward({
                      ...newReward,
                      pointsRequired: clamp(parseInt(e.target.value) || minPts, minPts, maxPts),
                    })
                  }
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-white"
                />

                {/* Contextual explanation */}
                <div className="mt-3 p-3 rounded-md bg-[#0d1f3c] border border-[#1e3a5f] text-xs text-gray-400 space-y-1">
                  {isFirstReward ? (
                    <>
                      <p className="font-medium text-gray-300">
                        Pourquoi entre {minPts} et {maxPts} points ?
                      </p>
                      <p>
                        La première récompense doit être atteignable sans être trop facile. Une fourchette
                        de <span className="text-white">{minPts}–{maxPts} points</span> encourage les
                        clients à revenir plusieurs fois avant d'obtenir leur première récompense, sans
                        les décourager.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-300">
                        Pourquoi entre {minPts} et {maxPts} points ?
                      </p>
                      <p>
                        Chaque palier doit être <span className="text-white">au moins 100 points</span> au-dessus
                        du précédent pour rester motivant. L'écart maximal de{" "}
                        <span className="text-white">300 points</span> évite que les clients perdent patience
                        avant d'atteindre la prochaine récompense.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Description (optionnel)</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newReward.isActive}
                  onChange={(e) => setNewReward({ ...newReward, isActive: e.target.checked })}
                  id="reward-active"
                  className="accent-[#fe5502]"
                />
                <label htmlFor="reward-active" className="text-sm text-gray-300">Actif</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewardForm(false)}
                  className="px-3 py-1 border border-[#1e3a5f] rounded-md text-gray-400 hover:bg-[#1e3a5f] hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        {rewards.length === 0 ? (
          <p className="text-center text-gray-400 py-6">Aucune récompense configurée. Ajoutez-en une !</p>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="border border-[#1e3a5f] rounded-lg p-4 bg-[#0a1628]">
                {editingReward?.id === reward.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingReward.name}
                      onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                      className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-white"
                    />
                    <input
                      type="number"
                      value={editingReward.pointsRequired}
                      onChange={(e) =>
                        setEditingReward({ ...editingReward, pointsRequired: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-white"
                    />
                    <textarea
                      value={editingReward.description || ""}
                      onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-white"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingReward.isActive}
                        onChange={(e) => setEditingReward({ ...editingReward, isActive: e.target.checked })}
                        id={`edit-active-${reward.id}`}
                        className="accent-[#fe5502]"
                      />
                      <label htmlFor={`edit-active-${reward.id}`} className="text-sm text-gray-300">
                        Actif
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingReward(null)}
                        className="px-3 py-1 border border-[#1e3a5f] rounded-md text-gray-400 hover:bg-[#1e3a5f] hover:text-white transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleUpdateReward(editingReward)}
                        disabled={saving}
                        className="px-3 py-1 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition-colors"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{reward.name}</h3>
                        {!reward.isActive && (
                          <span className="text-xs bg-[#1e3a5f] text-gray-400 px-2 py-0.5 rounded-full">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{reward.pointsRequired} points requis</p>
                      {reward.description && (
                        <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReward(reward)}
                        className="text-[#fe5502] hover:text-[#e0682e] transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}