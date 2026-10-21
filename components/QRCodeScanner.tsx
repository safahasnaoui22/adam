"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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

          await new Promise((resolve) => setTimeout(resolve, 500));
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

  /* ───────────── Initial state: single CTA button ───────────── */
  if (!showNameInput) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowNameInput(true)}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#fe5502] to-[#ff7a33] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-300/50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Commencer</span>
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
          {/* shimmer overlay */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </div>
    );
  }

  /* ───────────── Name form state ───────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#282424]">
          Créez votre compte
        </h3>
        <p className="mt-1 text-sm text-[#7f8489]">
          Entrez votre nom pour commencer à gagner des points
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="customer-name"
          className="block text-sm font-medium text-[#282424]"
        >
          Nom complet
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-[#b0aeb3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            id="customer-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            placeholder="Ex: Ahmed Ben Ali"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-3.5 pl-12 pr-4 text-sm text-[#282424] placeholder-[#b0aeb3] transition-all duration-200 focus:border-[#fe5502] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            autoFocus
            disabled={loading}
            aria-invalid={!!error}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#fe5502] to-[#ff7a33] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300/50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Création…</span>
            </>
          ) : (
            <>
              <span>Créer mon compte</span>
              <svg
                className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </span>
        {!loading && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setShowNameInput(false);
          setError("");
          setName("");
        }}
        disabled={loading}
        className="w-full text-sm font-medium text-[#7f8489] transition-colors hover:text-[#fe5502] disabled:opacity-50"
      >
        ← Retour
      </button>
    </form>
  );
}