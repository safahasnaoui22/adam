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
  className="tailwind-test w-full py-3.5 bg-gradient-to-r from-[#fe5502] to-[#ff7a33] text-white rounded-xl font-semibold"
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
        className="w-full px-4 py-3.5 border border-gray-200 bg-gray-50/60 rounded-xl text-[#282424] placeholder-[#b0aeb3] focus:ring-4 focus:ring-orange-500/10 focus:border-[#fe5502] focus:bg-white outline-none transition-all duration-200 disabled:opacity-60"
        autoFocus
        disabled={loading}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#fe5502] to-[#ff7a33] text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
      >
        {loading ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}