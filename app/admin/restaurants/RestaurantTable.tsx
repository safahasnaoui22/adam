// app/admin/restaurants/RestaurantTable.tsx
"use client";

import { useState } from "react";
import { Restaurant, User } from "@prisma/client";

// Define the type to match what we're getting from the database
interface RestaurantWithDetails extends Restaurant {
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  _count: {
    customers: number;
  };
  loyaltyProgram: {
    id: string;
  } | null;
  subscription?: {
    plan: string;
  } | null;
  plan?: string; // Computed field from API
}

interface RestaurantTableProps {
  restaurants: RestaurantWithDetails[];
}

export default function RestaurantTable({ restaurants: initialRestaurants }: RestaurantTableProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (restaurantId: string, newStatus: string) => {
    setUpdatingId(restaurantId);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedRestaurant = await res.json();
        setRestaurants(restaurants.map(r => 
          r.id === restaurantId ? { ...r, accountStatus: updatedRestaurant.accountStatus } : r
        ));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update status");
      }
    } catch (error) {
      setError("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePlanChange = async (restaurantId: string, newPlan: string) => {
    setUpdatingId(restaurantId);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (res.ok) {
        const updatedRestaurant = await res.json();
        setRestaurants(restaurants.map(r => 
          r.id === restaurantId 
            ? { ...r, subscription: { ...r.subscription, plan: updatedRestaurant.plan }, plan: updatedRestaurant.plan } 
            : r
        ));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update plan");
      }
    } catch (error) {
      setError("Failed to update plan");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (restaurantId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible.")) {
      return;
    }

    setUpdatingId(restaurantId);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRestaurants(restaurants.filter(r => r.id !== restaurantId));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete restaurant");
      }
    } catch (error) {
      setError("Failed to delete restaurant");
    } finally {
      setUpdatingId(null);
    }
  };

  const getPlanDisplay = (restaurant: RestaurantWithDetails) => {
    const plan = restaurant.subscription?.plan || restaurant.plan || "FREE";
    switch(plan) {
      case "FREE": return "Gratuit";
      case "BASIC": return "Basic";
      case "PREMIUM": return "Premium";
      case "ENTERPRISE": return "Enterprise";
      default: return "Gratuit";
    }
  };

  if (restaurants.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-8 text-center">
        <p className="text-[#7f8489]">Aucun restaurant trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {error && (
        <div className="bg-[#ffd9b9] text-[#e0682e] p-4 m-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#c6c9c8]">
          <thead className="bg-[#fdf9f4]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Clients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#7f8489] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#c6c9c8]">
            {restaurants.map((restaurantItem) => (
              <tr key={restaurantItem.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#282424]">{restaurantItem.name}</div>
                  <div className="text-sm text-[#7f8489]">{restaurantItem.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#282424]">{restaurantItem.phoneNumber || "-"}</div>
                  <div className="text-sm text-[#7f8489]">{restaurantItem.address || "-"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#282424]">{restaurantItem.owner.name || "-"}</div>
                  <div className="text-sm text-[#7f8489]">{restaurantItem.owner.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={restaurantItem.accountStatus}
                    onChange={(e) => handleStatusChange(restaurantItem.id, e.target.value)}
                    disabled={updatingId === restaurantItem.id}
                    className={`text-sm rounded-full px-3 py-1 font-semibold border ${
                      restaurantItem.accountStatus === "ACTIVE"
                        ? "bg-[#ffd9b9] text-[#e0682e] border-[#e0682e]"
                        : restaurantItem.accountStatus === "PENDING"
                        ? "bg-[#ffd9b9] text-[#fe5502] border-[#fe5502]"
                        : "bg-[#c6c9c8] text-[#7f8489] border-[#7f8489]"
                    }`}
                  >
                    <option value="PENDING">En attente</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="SUSPENDED">Suspendu</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={restaurantItem.subscription?.plan || restaurantItem.plan || "FREE"}
                    onChange={(e) => handlePlanChange(restaurantItem.id, e.target.value)}
                    disabled={updatingId === restaurantItem.id}
                    className="text-sm rounded-md px-2 py-1 border border-[#c6c9c8] bg-white text-[#282424]"
                  >
                    <option value="FREE">Gratuit</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#282424]">
                  {restaurantItem._count.customers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7f8489]">
                  {new Date(restaurantItem.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(restaurantItem.id)}
                    disabled={updatingId === restaurantItem.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {updatingId === restaurantItem.id ? "..." : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}