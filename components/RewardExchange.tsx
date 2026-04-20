"use client";

import { useState } from "react";

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
}

interface Customer {
  id: string;
  name: string;
  customerId: string;
  points: number;
}

export default function RewardExchange() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchCustomer = async (customerId: string) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/customer/by-id/${customerId}`);
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.customer);
        setRewards(data.rewards);
      } else {
        setError(data.error || "Client non trouvé");
        setCustomer(null);
        setRewards([]);
      }
    } catch (err) {
      setError("Erreur de connexion");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerIdInput.trim()) {
      fetchCustomer(customerIdInput.trim());
    } else {
      setError("Veuillez entrer un numéro de carte");
    }
  };

  const handleRedeem = async (rewardId: string, pointsRequired: number) => {
    if (!customer) return;
    if (confirm(`Échanger cette récompense (${pointsRequired} points) ?`)) {
      setRedeeming(rewardId);
      try {
        const res = await fetch("/api/customer/redeem-reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: customer.id,
            rewardId,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessMsg(`Récompense échangée ! Nouveau solde : ${data.newPoints} points`);
          // Refresh customer data
          fetchCustomer(customer.customerId);
        } else {
          setError(data.error || "Erreur lors de l'échange");
        }
      } catch (err) {
        setError("Erreur de connexion");
      } finally {
        setRedeeming(null);
      }
    }
  };

  return (
    <div className="bg-[#0d1f3c] rounded-lg shadow border border-[#1e3a5f] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎁</span>
        <h2 className="text-xl font-semibold text-white">Échanger une récompense</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">Scannez la carte du client ou saisissez son numéro</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === "scan"
              ? "bg-[#fe5502] text-white"
              : "bg-[#1e3a5f] text-gray-300 hover:bg-[#2a4a7a]"
          }`}
        >
          📷 Scanner
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === "manual"
              ? "bg-[#fe5502] text-white"
              : "bg-[#1e3a5f] text-gray-300 hover:bg-[#2a4a7a]"
          }`}
        >
          ✏️ Saisir le numéro
        </button>
      </div>

      {mode === "manual" && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Numéro de carte (ex: CUST-123456-ABC)"
            value={customerIdInput}
            onChange={(e) => setCustomerIdInput(e.target.value)}
            className="w-full px-3 py-2 bg-[#1e3a5f] border border-[#2a4a7a] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe5502]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition disabled:opacity-50"
          >
            {loading ? "Recherche..." : "Détecter"}
          </button>
        </form>
      )}

      {mode === "scan" && (
        <div className="text-center py-6">
          <div className="bg-[#1e3a5f] p-4 rounded-lg inline-block">
            <span className="text-4xl">📱</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Utilisez la caméra pour scanner le QR code du client
          </p>
          <button className="mt-3 px-4 py-2 bg-[#fe5502] text-white rounded-md text-sm">
            Lancer le scanner
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-md text-green-300 text-sm">
          {successMsg}
        </div>
      )}

      {customer && (
        <div className="mt-6 border-t border-[#1e3a5f] pt-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-gray-400">Client</p>
              <p className="text-lg font-semibold text-white">{customer.name}</p>
              <p className="text-xs text-gray-400">ID: {customer.customerId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Points disponibles</p>
              <p className="text-2xl font-bold text-[#fe5502]">{customer.points}</p>
            </div>
          </div>

          {rewards.length > 0 && (
            <div>
              <p className="text-sm font-medium text-white mb-2">Récompenses disponibles</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {rewards.map((reward) => {
                  const isAvailable = customer.points >= reward.pointsRequired;
                  return (
                    <div
                      key={reward.id}
                      className={`flex justify-between items-center p-3 rounded-md ${
                        isAvailable ? "bg-[#1e3a5f]" : "bg-[#0a1528] opacity-60"
                      }`}
                    >
                      <div>
                        <p className="text-white font-medium">{reward.name}</p>
                        <p className="text-xs text-gray-400">{reward.pointsRequired} points</p>
                        {reward.description && (
                          <p className="text-xs text-gray-400">{reward.description}</p>
                        )}
                      </div>
                      {isAvailable && (
                        <button
                          onClick={() => handleRedeem(reward.id, reward.pointsRequired)}
                          disabled={redeeming === reward.id}
                          className="px-3 py-1 bg-[#fe5502] text-white text-sm rounded-md hover:bg-[#e0682e] disabled:opacity-50"
                        >
                          {redeeming === reward.id ? "..." : "Échanger"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {rewards.length === 0 && (
            <p className="text-sm text-gray-400">Aucune récompense configurée.</p>
          )}
        </div>
      )}
    </div>
  );
}dashboard