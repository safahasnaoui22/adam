"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRedirect({ restaurantSlug }: { restaurantSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    const storedSlug = localStorage.getItem("restaurantSlug");
    const restaurantId = localStorage.getItem("restaurantId");

    if (customerId && storedSlug === restaurantSlug && restaurantId) {
      // Redirect to the existing client dashboard with the restaurantId as query parameter
      router.replace(`/client/dashboard?restaurantId=${restaurantId}`);
    }
  }, [restaurantSlug, router]);

  return null;
}