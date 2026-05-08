"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface QRCodeScannerProps {
  restaurantId: string;
  restaurantSlug: string;
}

export default function QRCodeScanner({ restaurantId, restaurantSlug }: QRCodeScannerProps) {
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateAccount = async (e: React.FormEvent) => {
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
        console.log("Account created:", data);

        // Sign in with the temporary password
        if (data.tempPassword && data.email) {
          console.log("Attempting to sign in with:", data.email, data.tempPassword);

          const signInResult = await signIn("credentials", {
            email: data.email,
            password: data.tempPassword,
            redirect: false,
          });

          console.log("Sign in result:", signInResult);

          if (signInResult?.ok) {
            // Store the public customerId and name in localStorage
          localStorage.setItem("customerId", data.customer.customerId);   // changed from "clientId"
localStorage.setItem("customerName", data.customer.name);       // optional
localStorage.setItem("restaurantId", restaurantId);
localStorage.setItem("restaurantSlug", restaurantSlug);

            console.log("Stored in localStorage:", {
              clientId: data.customer.customerId,
              clientName: data.customer.name,
              restaurantId,
            });

            // Wait a moment for the session to be fully set
            await new Promise(resolve => setTimeout(resolve, 500));

            // ✅ Redirect to the OLD dashboard with restaurantId as query parameter
            console.log("Sign in successful, redirecting to:", `/client/dashboard?restaurantId=${restaurantId}`);
            router.push(`/client/dashboard?restaurantId=${restaurantId}`);
            router.refresh();
          } else {
            console.error("Sign in failed:", signInResult?.error);
            setError("Compte créé, mais erreur de connexion. Veuillez vous connecter.");
          }
        } else {
          console.error("No tempPassword or email received");
          setError("Erreur: données de connexion manquantes");
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

  if (!showNameInput) {
    return (
      <div className="text-center">
        <button
          onClick={() => setShowNameInput(true)}
          className="w-full py-3 bg-[#fe5502] text-white rounded-lg font-medium hover:bg-[#e0682e] transition-colors"
        >
          Commencer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreateAccount} className="space-y-4">
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