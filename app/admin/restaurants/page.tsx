"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  owner: { name: string; email: string };
  accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING";
  subscription: { plan: string } | null;
  createdAt: string;
  _count: { customers: number };
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants");
      const data = await res.json();
      if (res.ok) {
        setRestaurants(data);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (restaurantId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/restaurants/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, status: newStatus }),
      });

      if (res.ok) {
        fetchRestaurants(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (restaurantId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible.")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/restaurants/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });

      if (res.ok) {
        fetchRestaurants(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.phoneNumber.includes(searchTerm);
    const matchesFilter = filter === "ALL" || restaurant.accountStatus === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p>Chargement des restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Restaurants</h1>
        <button
          onClick={fetchRestaurants}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Rafraîchir
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="PENDING">En attente</option>
          <option value="SUSPENDED">Suspendu</option>
        </select>
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
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRestaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{restaurant.email}</div>
                  <div className="text-sm text-gray-500">{restaurant.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{restaurant.owner.name}</div>
                  <div className="text-sm text-gray-500">{restaurant.owner.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={restaurant.accountStatus}
                    onChange={(e) => handleStatusChange(restaurant.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                      restaurant.accountStatus === "ACTIVE" ? "bg-green-100 text-green-800" :
                      restaurant.accountStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="PENDING">En attente</option>
                    <option value="SUSPENDED">Suspendu</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select className="text-sm text-gray-900 border rounded-md px-2 py-1">
                    <option value="FREE">Gratuit</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {restaurant._count.customers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(restaurant.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="text-red-600 hover:text-red-900 ml-2"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun restaurant trouvé
          </div>
        )}
      </div>
    </div>
  );
}