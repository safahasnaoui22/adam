// app/dashboard/loyalty-program/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // optional, but we'll use simple alert for now

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
    setSaving(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReward),
      });
      const data = await res.json();
      if (res.ok) {
        setRewards([...rewards, data]);
        setShowRewardForm(false);
        setNewReward({ name: "", pointsRequired: 100, description: "", isActive: true });
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
        setRewards(rewards.map(r => r.id === reward.id ? data : r));
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
      if (res.ok) {
        setRewards(rewards.filter(r => r.id !== id));
        toast?.success("Récompense supprimée");
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      alert("Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe5502]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#282424] mb-2">Portefeuille de points</h1>
      <p className="text-[#7f8489] mb-8">
        Configurez les règles de gain de points et les paliers de récompenses.
      </p>

      {/* How it works */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#282424] mb-4">Comment ça marche</h2>
        <div className="flex items-center space-x-4 text-sm text-[#7f8489]">
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
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#282424] mb-4">Récompensez les clients avec des points</h2>
        <form onSubmit={handleUpdateProgram} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#282424] mb-1">
                Palier de dépense *
              </label>
              <input
                type="number"
                step="0.01"
                value={spendThreshold}
                onChange={(e) => setSpendThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-[#c6c9c8] rounded-md focus:ring-[#fe5502] focus:border-[#fe5502]"
                required
              />
              <p className="text-xs text-[#7f8489] mt-1">Montant minimum d'achat pour gagner des points</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#282424] mb-1">
                Points gagnés *
              </label>
              <input
                type="number"
                value={pointsEarned}
                onChange={(e) => setPointsEarned(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#c6c9c8] rounded-md focus:ring-[#fe5502] focus:border-[#fe5502]"
                required
              />
              <p className="text-xs text-[#7f8489] mt-1">Points attribués à chaque palier atteint</p>
            </div>
          </div>
          <div className="bg-[#fdf9f4] p-4 rounded-md">
            <p className="text-sm text-[#282424]">
              <strong>Règle actuelle :</strong> Pour chaque {spendThreshold} DT dépensé → {pointsEarned} star(s) gagnés
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      {/* Rewards */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#282424]">Paliers de récompenses</h2>
          <button
            onClick={() => setShowRewardForm(!showRewardForm)}
            className="text-sm bg-[#fe5502] text-white px-3 py-1 rounded-md hover:bg-[#e0682e]"
          >
            + Ajouter une récompense
          </button>
        </div>

        {showRewardForm && (
          <div className="border border-[#c6c9c8] rounded-lg p-4 mb-6 bg-[#fdf9f4]">
            <h3 className="font-medium mb-3">Nouvelle récompense</h3>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#282424]">Nom de la récompense *</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c6c9c8] rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#282424]">Points requis *</label>
                <input
                  type="number"
                  value={newReward.pointsRequired}
                  onChange={(e) => setNewReward({ ...newReward, pointsRequired: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#c6c9c8] rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#282424]">Description (optionnel)</label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#c6c9c8] rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newReward.isActive}
                  onChange={(e) => setNewReward({ ...newReward, isActive: e.target.checked })}
                  id="reward-active"
                />
                <label htmlFor="reward-active" className="text-sm">Actif</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewardForm(false)}
                  className="px-3 py-1 border border-[#c6c9c8] rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        {rewards.length === 0 ? (
          <p className="text-center text-[#7f8489] py-6">Aucune récompense configurée. Ajoutez-en une !</p>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="border border-[#c6c9c8] rounded-lg p-4">
                {editingReward?.id === reward.id ? (
                  // Edit form
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingReward.name}
                      onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <input
                      type="number"
                      value={editingReward.pointsRequired}
                      onChange={(e) => setEditingReward({ ...editingReward, pointsRequired: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <textarea
                      value={editingReward.description || ""}
                      onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingReward.isActive}
                        onChange={(e) => setEditingReward({ ...editingReward, isActive: e.target.checked })}
                        id={`edit-active-${reward.id}`}
                      />
                      <label htmlFor={`edit-active-${reward.id}`}>Actif</label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingReward(null)}
                        className="px-3 py-1 border rounded-md"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleUpdateReward(editingReward)}
                        disabled={saving}
                        className="px-3 py-1 bg-[#fe5502] text-white rounded-md"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#282424]">{reward.name}</h3>
                        {!reward.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Inactif</span>
                        )}
                      </div>
                      <p className="text-sm text-[#7f8489]">{reward.pointsRequired} points requis</p>
                      {reward.description && (
                        <p className="text-sm text-[#7f8489] mt-1">{reward.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReward(reward)}
                        className="text-[#fe5502] hover:text-[#e0682e]"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="text-red-600 hover:text-red-800"
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