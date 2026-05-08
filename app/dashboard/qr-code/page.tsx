"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

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
      // No data, redirect to login or show error
      router.push(`/client/login?restaurantId=${restaurantId || ""}`);
      return;
    }

    const fetchData = async () => {
      try {
        const [clientRes, restaurantRes] = await Promise.all([
          fetch(`/api/client/${clientId}`),
          fetch(`/api/restaurant/${storedRestaurantId}`),
        ]);

        if (!clientRes.ok) throw new Error("Client non trouvé");
        if (!restaurantRes.ok) throw new Error("Restaurant non trouvé");

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4"></div>
          <p className="text-gray-400">Chargement de votre carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a1628]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#fe5502] text-white rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!client || !restaurant) return null;

  // Theme fallback (ensures no undefined background)
  const defaultColors = {
    primary: "#fe5502",
    secondary: "#e0682e",
    background: "#0a1628",
    cardBg: "#0d1f3c",
    text: "#ffffff",
  };
  const theme = restaurant?.theme || {};
  const colors = theme.colors || defaultColors;
  const dynamicStyles = {
    primary: colors.primary || defaultColors.primary,
    secondary: colors.secondary || defaultColors.secondary,
    background: colors.background || defaultColors.background,
    cardBg: colors.cardBackground || defaultColors.cardBg,
    text: colors.text || defaultColors.text,
  };

  const rewards = restaurant.loyaltyProgram?.rewards || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: dynamicStyles.background }}>
      <div
        className="max-w-md mx-auto min-h-screen shadow-lg relative border-x"
        style={{
          backgroundColor: dynamicStyles.cardBg,
          borderColor: `${dynamicStyles.primary}20`,
          color: dynamicStyles.text,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm"
          style={{ borderColor: `${dynamicStyles.primary}20`, backgroundColor: dynamicStyles.cardBg }}
        >
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

        {/* Client Info */}
        <div className="px-4 py-6 text-center border-b" style={{ borderColor: `${dynamicStyles.primary}20` }}>
          <h2 className="text-2xl font-bold" style={{ color: dynamicStyles.text }}>{client.name}</h2>
          <p className="text-sm mt-1" style={{ color: `${dynamicStyles.text}99` }}>ID: #{getShortId()}</p>
        </div>

        {/* Balance */}
        <div className="px-4 py-4 border-b" style={{ borderColor: `${dynamicStyles.primary}20` }}>
          <p className="text-sm" style={{ color: `${dynamicStyles.text}80` }}>Votre solde est</p>
          <p className="text-3xl font-bold" style={{ color: dynamicStyles.primary }}>{client.points || 0} ⭐</p>
          <p className="text-xs mt-1" style={{ color: `${dynamicStyles.text}70` }}>1 DT = 10 ⭐</p>
        </div>

        {/* QR Code Button */}
        <div className="px-4 py-4 border-b" style={{ borderColor: `${dynamicStyles.primary}20` }}>
          <button
            onClick={() => alert("Présentez ce code au staff")}
            className="w-full py-4 rounded-xl font-medium text-white"
            style={{ backgroundColor: dynamicStyles.primary }}
          >
            📱 Mon Code QR
          </button>
        </div>

        {/* Rewards */}
        {rewards.length > 0 && (
          <div className="px-4 py-4">
            <h3 className="font-semibold mb-3" style={{ color: dynamicStyles.text }}>Mes récompenses</h3>
            <div className="grid grid-cols-2 gap-2">
              {rewards.map((reward: any) => (
                <div key={reward.id} className="p-2 rounded-lg text-center" style={{ backgroundColor: `${dynamicStyles.primary}20` }}>
                  <p className="text-sm" style={{ color: dynamicStyles.text }}>{reward.name}</p>
                  <p className="text-xs font-bold" style={{ color: dynamicStyles.primary }}>{reward.pointsRequired}⭐</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}