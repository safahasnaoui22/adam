"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRedirect({ restaurantSlug }: { restaurantSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    const storedSlug = localStorage.getItem("restaurantSlug");

    if (customerId && storedSlug === restaurantSlug) {
      // Already registered – redirect instantly
      router.replace(`/${restaurantSlug}/dashboard`);
    }
  }, [restaurantSlug, router]);

  return null;
}