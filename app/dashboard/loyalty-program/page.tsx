// app/dashboard/loyalty-program/page.tsx
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

  // ─── Range helpers ───────────────────────────────────────────────────────────
  /**
   * Returns the [min, max] points range for the *next* reward to be added.
   *
   * Rules:
   *  - First reward  → 100 – 300 pts
   *  - Every subsequent reward → (prevMax + 100) – (prevMax + 300)
   *
   * This ensures every tier is meaningfully harder to reach than the one before
   * it, while giving the owner flexibility to space tiers as they see fit.
   */
  const getNextPointsRange = (rewardsList: Reward[]): [number, number] => {
    if (rewardsList.length === 0) return [100, 300];
    const maxPoints = Math.max(...rewardsList.map((r) => r.pointsRequired));
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
  const [minPts, maxPts] = getNextPointsRange(rewards);
  const isFirstReward = rewards.length === 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">Portefeuille de points</h1>
      <p className="text-gray-400 mb-8">
        Configurez les règles de gain de points et les paliers de récompenses.
      </p>

      {/* How it works */}
      <div className="bg-[#0d1f3c] rounded-xl shadow p-6 mb-8 border border-[#1e3a5f]">
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
      <div className="bg-[#0d1f3c] rounded-xl shadow p-6 mb-8 border border-[#1e3a5f]">
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
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
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
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Points attribués à chaque palier atteint</p>
            </div>
          </div>
          <div className="bg-[#0a1628] p-4 rounded-md border border-[#1e3a5f]">
            <p className="text-sm text-gray-300">
              <strong>Règle actuelle :</strong> Pour chaque {spendThreshold} DT dépensé → {pointsEarned} star(s) gagnés
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
                        className="text-red-500 hoRécompensez les clients avec des pointser:text-red-400 transition-colors"
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