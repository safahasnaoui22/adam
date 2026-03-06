"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveForm({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/restaurants/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          status: "ACTIVE",
        }),
      });

      if (res.ok) {
        router.push("/admin/restaurants");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">{restaurant.name}</h2>
        <p className="text-gray-600">Propriétaire: {restaurant.owner.name}</p>
        <p className="text-gray-600">Email: {restaurant.owner.email}</p>
        <p className="text-gray-600">Téléphone: {restaurant.phoneNumber}</p>
        <p className="text-gray-600">Inscrit le: {new Date(restaurant.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Approbation..." : "Approuver le restaurant"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}