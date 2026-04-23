// components/AutoLogin.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AutoLoginProps {
  restaurantSlug: string;
}

export default function AutoLogin({ restaurantSlug }: AutoLoginProps) {
  const router = useRouter();

  useEffect(() => {
    const storedCustomerId = localStorage.getItem("customerId");
    const storedSlug = localStorage.getItem("restaurantSlug");

    if (storedCustomerId && storedSlug === restaurantSlug) {
      // Attempt silent login
      fetch("/api/auth/silent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: storedCustomerId, restaurantSlug }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Reload to get the fresh session and redirect (server will redirect to dashboard)
            window.location.href = `/${restaurantSlug}/dashboard`;
          }
        })
        .catch((err) => console.error("Auto‑login failed", err));
    }
  }, [restaurantSlug, router]);

  // This component renders nothing – it only runs the effect
  return null;
}