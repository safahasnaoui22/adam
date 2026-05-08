"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function QRCodeScanner({ restaurantId, restaurantSlug }: { restaurantId: string; restaurantSlug: string }) {
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez entrer votre nom");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), restaurantId }),
      });
      const data = await res.json();

      if (res.ok && data.tempPassword && data.email) {
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.tempPassword,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Store the keys the dashboard expects
          localStorage.setItem("clientId", data.customer.customerId);
          localStorage.setItem("clientName", data.customer.name);
          localStorage.setItem("restaurantId", restaurantId);
          localStorage.setItem("restaurantSlug", restaurantSlug);

          console.log("Stored:", {
            clientId: data.customer.customerId,
            clientName: data.customer.name,
            restaurantId,
          });

          await new Promise(resolve => setTimeout(resolve, 500));
          router.push(`/client/dashboard?restaurantId=${restaurantId}`);
          router.refresh();
        } else {
          setError("Compte créé, mais erreur de connexion.");
        }
      } else {
        setError(data.error || "Erreur lors de la création du compte");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (!showNameInput) {
    return (
      <div className="text-center">
        <button
          onClick={() => setShowNameInput(true)}
          className="w-full py-3 bg-[#fe5502] text-white rounded-lg font-medium hover:bg-[#e0682e]"
        >
          Commencer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Entrez votre nom complet"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fe5502]"
        autoFocus
        disabled={loading}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#fe5502] text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}