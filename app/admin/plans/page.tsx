"use client";

import { useState, useEffect } from "react";

interface Restaurant {
  id: string;
  name: string;
  plan: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  customerCount: number;
}

interface PlanStats {
  FREE: number;
  BASIC: number;
  PREMIUM: number;
  ENTERPRISE: number;
}

export default function PlansPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<PlanStats>({ FREE: 0, BASIC: 0, PREMIUM: 0, ENTERPRISE: 0 });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (res.ok) {
        setRestaurants(data.restaurants);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpdate = async (restaurantId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, plan: newPlan }),
      });

      if (res.ok) {
        fetchPlans();
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to update plan:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion des Plans</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
                <span className="text-white font-bold">FREE</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Gratuit</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.FREE}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <span className="text-white font-bold">BASIC</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Basic</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.BASIC}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <span className="text-white font-bold">PREMIUM</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Premium</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.PREMIUM}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <span className="text-white font-bold">ENTERPRISE</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Enterprise</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.ENTERPRISE}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date début
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date fin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Auto-renouvellement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === restaurant.id ? (
                    <select
                      defaultValue={restaurant.plan}
                      onChange={(e) => handlePlanUpdate(restaurant.id, e.target.value)}
                      className="text-sm border rounded-md px-2 py-1"
                    >
                      <option value="FREE">Gratuit</option>
                      <option value="BASIC">Basic</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      restaurant.plan === "FREE" ? "bg-gray-100 text-gray-800" :
                      restaurant.plan === "BASIC" ? "bg-blue-100 text-blue-800" :
                      restaurant.plan === "PREMIUM" ? "bg-purple-100 text-purple-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {restaurant.plan}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurant.startDate ? new Date(restaurant.startDate).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurant.endDate ? new Date(restaurant.endDate).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurant.customerCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    restaurant.autoRenew ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {restaurant.autoRenew ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingId === restaurant.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(restaurant.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}