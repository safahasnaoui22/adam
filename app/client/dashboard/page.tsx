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
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = localStorage.getItem("clientId");
    const clientName = localStorage.getItem("clientName");
    const storedRestaurantId = localStorage.getItem("restaurantId");

    if (!clientId || !clientName || !storedRestaurantId) {
      router.push(`/client/login?restaurantId=${restaurantId || ""}`);
      return;
    }

    const fetchData = async () => {
      try {
        const [clientRes, restaurantRes] = await Promise.all([
          fetch(`/api/client/${clientId}`),
          fetch(`/api/restaurant/${storedRestaurantId}`),
        ]);

        if (!clientRes.ok) throw new Error("Client not found");
        if (!restaurantRes.ok) throw new Error("Restaurant not found");

        const clientData = await clientRes.json();
        const restaurantData = await restaurantRes.json();

        setClient(clientData);
        setRestaurant(restaurantData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, router]);

  const getShortId = () => {
    if (client?.customerId && client.customerId.includes('-')) {
      const parts = client.customerId.split('-');
      const lastPart = parts[parts.length - 1];
      return lastPart.slice(-4);
    }
    return "****";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!client || !restaurant) return null;

  const defaultColors = {
    primary: "#fe5502",
    background: "#ffffff",
    text: "#1f2937",
  };
  const theme = restaurant?.theme || {};
  const colors = theme.colors || defaultColors;
  const dynamicStyles = {
    primary: colors.primary || defaultColors.primary,
    background: colors.background || defaultColors.background,
    text: colors.text || defaultColors.text,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: dynamicStyles.background }}>
      <div
        className="max-w-md mx-auto min-h-screen shadow-lg relative border-x"
        style={{
          backgroundColor: "#ffffff",
          borderColor: `${dynamicStyles.primary}20`,
          color: dynamicStyles.text,
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: `${dynamicStyles.primary}20` }}>
          <div className="flex-1 flex justify-center">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-full border" style={{ borderColor: dynamicStyles.primary }} />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: dynamicStyles.primary }}>
                {restaurant.name?.charAt(0) || "R"}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-6 text-center border-b" style={{ borderColor: `${dynamicStyles.primary}20` }}>
          <h2 className="text-2xl font-bold" style={{ color: dynamicStyles.text }}>{client.name}</h2>
          <p className="text-sm mt-1" style={{ color: `${dynamicStyles.text}99` }}>ID: #{getShortId()}</p>
        </div>

        <div className="px-4 py-4 border-b" style={{ borderColor: `${dynamicStyles.primary}20` }}>
          <p className="text-sm" style={{ color: `${dynamicStyles.text}80` }}>Votre solde</p>
          <p className="text-3xl font-bold" style={{ color: dynamicStyles.primary }}>{client.points || 0} ⭐</p>
        </div>

        <div className="px-4 py-4">
          <p className="text-center text-gray-500">Version simplifiée – test réussi</p>
        </div>
      </div>
    </div>
  );
}