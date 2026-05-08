"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function ClientDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantId = searchParams.get("restaurantId");

  const [client, setClient] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientData = async (id: string) => {
    try {
      const res = await fetch(`/api/client/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClient(data);
      } else {
        throw new Error(data.error || "Client non trouvé");
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const fetchRestaurantData = async (id: string) => {
    try {
      const res = await fetch(`/api/restaurant/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRestaurant(data);
      } else {
        throw new Error(data.error || "Restaurant non trouvé");
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    let clientId = localStorage.getItem("clientId");
    let clientName = localStorage.getItem("clientName");
    let storedRestaurantId = localStorage.getItem("restaurantId");

    // Fallback to alternative keys
    if (!clientId) clientId = localStorage.getItem("customerId");
    if (!clientName) clientName = localStorage.getItem("customerName");

    if (clientId && clientName && storedRestaurantId) {
      Promise.all([fetchClientData(clientId), fetchRestaurantData(storedRestaurantId)])
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    } else {
      setError(`Données manquantes. clientId=${clientId}, clientName=${clientName}, restaurantId=${storedRestaurantId}`);
      setLoading(false);
    }
  }, [restaurantId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-700 font-medium mb-2">Erreur</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!client || !restaurant) return null;

  const getShortId = () => {
    if (client.customerId && client.customerId.includes('-')) {
      const parts = client.customerId.split('-');
      return parts[parts.length - 1].slice(-4);
    }
    return "****";
  };

  const theme = restaurant.theme?.colors || {};
  const primaryColor = theme.primary || "#fe5502";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 text-center border-b">
          {restaurant.logo ? (
            <img src={restaurant.logo} alt="logo" className="w-16 h-16 rounded-full mx-auto" />
          ) : (
            <div className="w-16 h-16 rounded-full mx-auto bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
              {restaurant.name?.charAt(0) || "R"}
            </div>
          )}
          <h2 className="text-xl font-bold mt-2">{restaurant.name}</h2>
        </div>
        <div className="p-4">
          <p className="text-center text-2xl font-bold" style={{ color: primaryColor }}>
            {client.name}
          </p>
          <p className="text-center text-gray-500">ID: #{getShortId()}</p>
          <p className="text-center text-3xl font-bold mt-4" style={{ color: primaryColor }}>
            {client.points} ⭐
          </p>
        </div>
      </div>
    </div>
  );
}