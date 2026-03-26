"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function RestaurantFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`/admin/restaurants?${params.toString()}`);
  };

  const handlePlanChange = (plan: string) => {
    const params = new URLSearchParams(searchParams);
    if (plan) {
      params.set("plan", plan);
    } else {
      params.delete("plan");
    }
    router.push(`/admin/restaurants?${params.toString()}`);
  };

  return (
    <div className="flex space-x-2">
      <select
        className="px-3 py-2 border border-[#c6c9c8] rounded-md text-sm"
        onChange={(e) => handleStatusChange(e.target.value)}
        defaultValue={searchParams.get("status") || ""}
      >
        <option value="">Tous les statuts</option>
        <option value="PENDING">En attente</option>
        <option value="ACTIVE">Actif</option>
        <option value="SUSPENDED">Suspendu</option>
      </select>
      <select
        className="px-3 py-2 border border-[#c6c9c8] rounded-md text-sm"
        onChange={(e) => handlePlanChange(e.target.value)}
        defaultValue={searchParams.get("plan") || ""}
      >
        <option value="">Tous les plans</option>
        <option value="FREE">Gratuit</option>
        <option value="PRO">Pro</option>
        <option value="ENTERPRISE">Enterprise</option>
      </select>
    </div>
  );
}