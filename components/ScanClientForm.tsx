"use client";

import { useState } from "react";

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
}

interface ScanClientFormProps {
  customerId: string;
  currentPoints: number;
  rewards: Reward[];
}

export default function ScanClientForm({ customerId, currentPoints, rewards }: ScanClientFormProps) {
  const [amount, setAmount] = useState("");
  const [redeemStars, setRedeemStars] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingRedeem, setLoadingRedeem] = useState(false);
  const [loadingReward, setLoadingReward] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [points, setPoints] = useState(currentPoints);

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ text: "Veuillez entrer un montant valide", type: "error" });
      return;
    }

    setLoadingAdd(true);
    setMessage(null);

    try {
      const res = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setMessage({ text: `${data.pointsAdded} points ajoutés ! Nouveau solde : ${data.newPoints} ⭐`, type: "success" });
        setAmount("");
      } else {
        setMessage({ text: data.error || "Erreur", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Erreur de connexion", type: "error" });
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    const stars = parseInt(redeemStars);
    if (isNaN(stars) || stars <= 0) {
      setMessage({ text: "Veuillez entrer un nombre valide de points", type: "error" });
      return;
    }
    if (stars > points) {
      setMessage({ text: "Points insuffisants", type: "error" });
      return;
    }

    setLoadingRedeem(true);
    setMessage(null);

    try {
      const res = await fetch("/api/customer/deduct-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, pointsToDeduct: stars }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setMessage({ text: `${data.deducted} points déduits. Nouveau solde : ${data.newPoints} ⭐`, type: "success" });
        setRedeemStars("");
      } else {
        setMessage({ text: data.error || "Erreur", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Erreur de connexion", type: "error" });
    } finally {
      setLoadingRedeem(false);
    }
  };

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (points < pointsRequired) {
      setMessage({ text: "Points insuffisants pour cette récompense", type: "error" });
      return;
    }

    setLoadingReward(rewardId);
    setMessage(null);

    try {
      const res = await fetch("/api/customer/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setMessage({ text: `Récompense échangée ! Nouveau solde : ${data.newPoints} ⭐`, type: "success" });
      } else {
        setMessage({ text: data.error || "Erreur", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Erreur de connexion", type: "error" });
    } finally {
      setLoadingReward(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add points section */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-3">Ajouter des points</h2>
        <form onSubmit={handleAddPoints} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant dépensé (DT)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: 20.00"
                disabled={loadingAdd}
              />
              <button
                type="submit"
                disabled={loadingAdd}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loadingAdd ? "..." : "Ajouter"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">1 DT = 10 ⭐</p>
          </div>
        </form>
      </div>

      {/* Redeem points manually */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-3">Utiliser des points</h2>
        <form onSubmit={handleRedeemPoints} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de points à déduire</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="10"
                value={redeemStars}
                onChange={(e) => setRedeemStars(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: 100"
                disabled={loadingRedeem}
              />
              <button
                type="submit"
                disabled={loadingRedeem}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
              >
                {loadingRedeem ? "..." : "Déduire"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Points disponibles : {points} ⭐</p>
          </div>
        </form>
      </div>

      {/* Rewards list */}
      {rewards.length > 0 && (
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">Récompenses disponibles</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {rewards.map((reward) => {
              const isAvailable = points >= reward.pointsRequired;
              return (
                <div
                  key={reward.id}
                  className={`flex justify-between items-center p-3 rounded-md ${
                    isAvailable ? "bg-orange-50 border border-orange-200" : "bg-gray-100 opacity-60"
                  }`}
                >
                  <div>
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-xs text-gray-500">{reward.pointsRequired} points</p>
                    {reward.description && <p className="text-xs text-gray-400">{reward.description}</p>}
                  </div>
                  {isAvailable && (
                    <button
                      onClick={() => handleRedeemReward(reward.id, reward.pointsRequired)}
                      disabled={loadingReward === reward.id}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loadingReward === reward.id ? "..." : "Échanger"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}