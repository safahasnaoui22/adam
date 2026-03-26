// components/CustomerSignup.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface CustomerSignupProps {
  restaurantId: string;
  restaurantSlug: string;
}

export default function CustomerSignup({ restaurantId, restaurantSlug }: CustomerSignupProps) {
  const router = useRouter(); // Add this line - initialize the router
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({
          name: name.trim(),
          restaurantId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Sign in with the temporary password (development only)
        if (data.tempPassword) {
          const signInResult = await signIn("credentials", {
            email: data.email,
            password: data.tempPassword,
            redirect: false,
          });

          if (signInResult?.ok) {
            router.push(`/${restaurantSlug}/dashboard`);
            router.refresh();
          } else {
            setError("Compte créé, mais erreur de connexion. Veuillez vous connecter.");
          }
        } else {
          router.push(`/${restaurantSlug}/dashboard`);
          router.refresh();
        }
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setError("Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#282424] mb-2">
          Votre nom
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrez votre nom complet"
          className="w-full px-4 py-3 border border-[#c6c9c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502] focus:border-transparent"
          autoFocus
          disabled={loading}
        />
      </div>
      
      {error && (
        <div className="bg-[#ffd9b9] text-[#e0682e] p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#fe5502] text-white rounded-lg font-medium hover:bg-[#e0682e] transition-colors disabled:opacity-50"
      >
        {loading ? "Création en cours..." : "Créer mon compte"}
      </button>
    </form>
  );
}