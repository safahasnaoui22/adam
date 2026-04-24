"use client";

import { useState } from "react";

interface ScanClientFormProps {
  customerId: string;
  currentPoints: number;
}

export default function ScanClientForm({ customerId, currentPoints }: ScanClientFormProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Veuillez entrer un montant valide (ex: 12.50)");
      return;
    }

    setLoading(true);
    setMessage("");

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
        setMessage(`✅ ${data.pointsAdded} points ajoutés ! Nouveau solde : ${data.newPoints} ⭐`);
        setAmount("");
        // Optionally refresh the page to show new points
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(data.error || "Erreur lors de l'ajout de points");
      }
    } catch (err) {
      setMessage("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t pt-4 mt-2">
      <h2 className="text-lg font-semibold mb-3">Ajouter des points</h2>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Montant dépensé (DT)
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          placeholder="Ex: 20.00"
          disabled={loading}
          required
        />
        <p className="text-xs text-gray-500 mt-1">1 DT = 10 ⭐</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
      >
        {loading ? "Ajout en cours..." : "Ajouter les points"}
      </button>
      {message && (
        <p className={`mt-3 text-sm text-center ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </form>
  );
}