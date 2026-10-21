"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { UserRound, ArrowRight, LoaderCircle } from "lucide-react";

export default function QRCodeScanner({
  restaurantId,
  restaurantSlug,
}: {
  restaurantId: string;
  restaurantSlug: string;
}) {
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Veuillez entrer votre nom complet.");
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

      if (res.ok && data.tempPassword && data.email) {
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.tempPassword,
          redirect: false,
        });

        if (signInResult?.ok) {
          localStorage.setItem("clientId", data.customer.customerId);
          localStorage.setItem("clientName", data.customer.name);
          localStorage.setItem("restaurantId", restaurantId);
          localStorage.setItem("restaurantSlug", restaurantSlug);

          await new Promise((resolve) => setTimeout(resolve, 300));

          router.push(`/client/dashboard?restaurantId=${restaurantId}`);
          router.refresh();
        } else {
          setError("Compte créé, mais erreur de connexion.");
        }
      } else {
        setError(data.error || "Erreur lors de la création du compte.");
      }
    } catch {
      setError("Une erreur de connexion est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle =
    "flex w-full box-border items-center justify-center gap-3 rounded-2xl border-0 bg-gradient-to-r from-[#fe5502] to-[#ff7a33] px-5 py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(254,85,2,0.22)] transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

  if (!showNameInput) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowNameInput(true)}
          className={buttonStyle}
        >
          <span>Commencer</span>
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Rejoignez notre programme de fidélité gratuitement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <label
        htmlFor="customer-name"
        className="block text-sm font-semibold text-[#352c28]"
      >
        Votre nom complet
      </label>

      <div className="relative w-full">
        <UserRound
          size={20}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#fe5502]"
        />

        <input
          id="customer-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="Ex. : Sarah Ben Ali"
          autoComplete="name"
          autoFocus
          disabled={loading}
          className="block w-full box-border appearance-none rounded-2xl border-2 border-[#f0e8e2] bg-[#fffdfa] px-4 py-4 pl-12 text-base text-[#282424] outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#fe5502] focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className={buttonStyle}>
        {loading ? (
          <>
            <LoaderCircle size={20} className="animate-spin" />
            <span>Création en cours...</span>
          </>
        ) : (
          <>
            <span>Créer mon compte</span>
            <ArrowRight size={20} strokeWidth={2.5} />
          </>
        )}
      </button>

      <p className="text-center text-xs leading-5 text-gray-500">
        Cumulez des points et profitez de récompenses exclusives.
      </p>
    </form>
  );
}