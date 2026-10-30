"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const KEYS = ["clientId", "clientName", "customerId", "restaurantId", "restaurantSlug"];

export function clearCustomerStorage() {
  try {
    KEYS.forEach((k) => localStorage.removeItem(k));
    Object.keys(localStorage)
      .filter((k) => k.startsWith("BONOO:lastPoints:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export default function ReturningCustomer({
  name,
  customerId,
  restaurantId,
  restaurantSlug,
}: {
  name: string;
  customerId: string;
  restaurantId: string;
  restaurantSlug: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleContinue = () => {
    setBusy(true);
    try {
      localStorage.setItem("clientId", customerId);
      localStorage.setItem("clientName", name);
      localStorage.setItem("restaurantId", restaurantId);
      localStorage.setItem("restaurantSlug", restaurantSlug);
    } catch {}
    // replace (not push): the Back button must not bounce the customer back here
    router.replace(`/client/dashboard?restaurantId=${restaurantId}`);
  };

  // The server only renders this component when the customer already has a valid
  // session for THIS business: open the card straight away, no extra tap.
  // ("Ce n'est pas moi" below still lets them switch account.)
  useEffect(() => {
    handleContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitch = async () => {
    setBusy(true);
    clearCustomerStorage();
    await signOut({ redirect: false });
    // full reload so the server renders the sign-up form with no session
    window.location.href = `/${restaurantSlug}`;
  };

  return (
    <div className="text-center">
      <p className="text-sm text-[#7f8489]">Bon retour</p>
      <h2 className="text-lg font-semibold text-[#282424] mb-4">{name}</h2>
      <button
        type="button"
        onClick={handleContinue}
        disabled={busy}
        className="w-full rounded-2xl bg-gradient-to-r from-[#fe5502] to-[#ff7a33] px-5 py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {busy ? "Ouverture de votre carte…" : `Continuer en tant que ${name}`}
      </button>
      <button
        type="button"
        onClick={handleSwitch}
        disabled={busy}
        className="mt-3 w-full text-sm font-medium text-[#7f8489] underline disabled:opacity-60"
      >
        Ce n'est pas moi — utiliser un autre compte
      </button>
    </div>
  );
}
