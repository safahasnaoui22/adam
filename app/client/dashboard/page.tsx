"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ClientDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantId = searchParams.get("restaurantId");

  const [client, setClient] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [activeTab, setActiveTab] = useState("rewards");

  // Helper to get short ID from customerId
  const getShortId = () => {
    if (!client?.customerId) return "****";
    const parts = client.customerId.split("-");
    const lastPart = parts[parts.length - 1];
    return lastPart.slice(-4);
  };

  // Fetch client data using public customerId
  const fetchClientData = async (id: string) => {
    try {
      const res = await fetch(`/api/client/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClient(data);
      } else {
        console.error("Client API error:", data);
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
    }
  };

  // Fetch restaurant data using restaurantId from localStorage or URL
  const fetchRestaurantData = async (id: string) => {
    try {
      const res = await fetch(`/api/restaurant/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRestaurant(data);
      } else {
        console.error("Restaurant API error:", data);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get from localStorage first (set by QRCodeScanner)
    let clientId = localStorage.getItem("clientId");
    let clientName = localStorage.getItem("clientName");
    let storedRestaurantId = localStorage.getItem("restaurantId");

    // Fallback to URL parameter
    if (!clientId && restaurantId) {
      // If we have restaurantId from URL, maybe we can derive clientId? Not really.
      // Instead, we redirect to login.
    }

    if (clientId && clientName && storedRestaurantId) {
      fetchClientData(clientId);
      fetchRestaurantData(storedRestaurantId);
    } else {
      // Redirect to login page with restaurantId parameter
      router.push(`/client/login?restaurantId=${restaurantId || ""}`);
    }
  }, [restaurantId, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const clientId = localStorage.getItem("clientId");
    if (clientId) {
      await fetchClientData(clientId);
    }
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAddToHomeScreen = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      alert("Déjà installé !");
      return;
    }
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      alert("Pour ajouter à l'écran d'accueil :\n1. Appuyez sur le bouton Partager\n2. Faites défiler vers le bas\n3. Appuyez sur 'Sur l'écran d'accueil'");
    } else if ('beforeinstallprompt' in window) {
      // @ts-ignore
      window.deferredPrompt.prompt();
    } else {
      alert("Utilisez 'Ajouter à l'écran d'accueil' dans le menu du navigateur");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Chargement de votre carte...</p>
        </div>
      </div>
    );
  }

  if (!client || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur de chargement des données</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Mock rewards (or use real data from restaurant)
  const rewards = restaurant.loyaltyProgram?.rewards?.length
    ? restaurant.loyaltyProgram.rewards.map((r: any) => ({
        id: r.id,
        name: r.name,
        stars: r.pointsRequired,
        icon: "🎁",
        description: r.description || ""
      }))
    : [
        { id: 1, name: "Café", stars: 100, icon: "☕", description: "Un café offert" },
        { id: 2, name: "Gâteau", stars: 200, icon: "🍰", description: "Une part de gâteau" },
        { id: 3, name: "Petit-déjeuner", stars: 300, icon: "🥐", description: "Petit-déjeuner complet" },
        { id: 4, name: "Déjeuner", stars: 500, icon: "🍝", description: "Plat du jour offert" },
      ];

  const coupons = restaurant.coupons || [
    { id: 1, name: "-20%", description: "Sur votre prochain café", validUntil: "30/06/2026" },
    { id: 2, name: "1+1", description: "Un gâteau acheté = un offert", validUntil: "15/07/2026" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="flex-1 flex justify-center">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {restaurant.name?.charAt(0) || "R"}
              </div>
            )}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Client Info with Short ID */}
        <div className="px-4 py-6 text-center border-b">
          <h2 className="text-2xl font-bold text-gray-800">{client.name}</h2>
          <p className="text-sm text-gray-500 mt-1">ID: #{getShortId()}</p>
          <p className="text-gray-600 mt-3 italic">Bonjour {client.name}, comment allez-vous aujourd'hui ?</p>
        </div>

        {/* Balance Section */}
        <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <p className="text-sm text-gray-600">Votre solde est</p>
          <p className="text-3xl font-bold text-indigo-600">{client.points || 0} ⭐</p>
          <p className="text-xs text-gray-500 mt-1">1 DT = 10 ⭐</p>
        </div>

        {/* QR Code Button */}
        <div className="px-4 py-4 border-b">
          <button onClick={() => setShowQR(!showQR)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-indigo-700 transition">
            <span>📱</span>
            <span>Mon Code QR</span>
          </button>
          {showQR && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-lg shadow-inner flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-r from-gray-800 to-gray-600 flex items-center justify-center text-white text-xs">
                  QR Code<br />{client.customerId}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Présentez ce code au staff</p>
            </div>
          )}
        </div>

        {/* Stars Progress Section */}
        <div className="px-4 py-4 border-b">
          <h3 className="font-semibold text-gray-700 mb-3">Vos étoiles</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-indigo-600">{client.points || 0} ⭐</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-indigo-600 rounded-full h-3 transition-all duration-300" style={{ width: `${Math.min((client.points || 0) / 500 * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {rewards.map((reward: any) => (
              <div key={reward.id} className="text-center">
                <div className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center p-1 ${(client.points || 0) >= reward.stars ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                  <span className="text-2xl">{reward.icon}</span>
                  <span className="text-xs font-medium mt-1">{reward.stars}⭐</span>
                </div>
                <p className="text-xs mt-1">{reward.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b">
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab("rewards")} className={`flex-1 py-2 font-medium text-sm border-b-2 transition ${activeTab === "rewards" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>🎁 Récompenses</button>
            <button onClick={() => setActiveTab("coupons")} className={`flex-1 py-2 font-medium text-sm border-b-2 transition ${activeTab === "coupons" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>🏷️ Coupons</button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 py-4 min-h-[200px]">
          {activeTab === "rewards" ? (
            <div className="space-y-3">
              <p className="text-sm text-green-600 font-medium mb-2">Récompense disponible :</p>
              <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">☕</span>
                  <div>
                    <p className="font-medium">Café offert</p>
                    <p className="text-xs text-gray-500">100 ⭐ - Valable jusqu'au 30/06</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg">Utiliser</button>
              </div>
              <p className="text-sm text-gray-600 mt-4">Autres récompenses :</p>
              {rewards.slice(1).map((reward: any) => (
                <div key={reward.id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between opacity-50">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-xs text-gray-500">{reward.stars} ⭐</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{reward.stars - (client.points || 0)} ⭐ manquantes</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.length > 0 ? coupons.map((coupon: any) => (
                <div key={coupon.id} className="border border-dashed border-indigo-300 bg-indigo-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-indigo-700">{coupon.name}</p>
                    <p className="text-xs text-gray-600">{coupon.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Valable jusqu'au {coupon.validUntil}</p>
                  </div>
                  <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg">Activer</button>
                </div>
              )) : <p className="text-center text-gray-500 py-8">Aucun coupon disponible</p>}
            </div>
          )}
        </div>

        {/* About Restaurant */}
        <div className="px-4 py-2 border-t">
          <button onClick={() => setShowAbout(!showAbout)} className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center space-x-2">
            <span>ℹ️</span>
            <span>À propos de {restaurant.name}</span>
          </button>
          {showAbout && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              {restaurant.description && <p className="text-sm text-gray-700">{restaurant.description}</p>}
              {restaurant.address && <div className="flex items-start space-x-2"><span className="text-gray-500">📍</span><p className="text-sm text-gray-700">{restaurant.address}</p></div>}
              {restaurant.phoneNumber && <div className="flex items-center space-x-2"><span className="text-gray-500">📞</span><a href={`tel:${restaurant.phoneNumber}`} className="text-sm text-indigo-600">{restaurant.phoneNumber}</a></div>}
              {restaurant.email && <div className="flex items-center space-x-2"><span className="text-gray-500">✉️</span><a href={`mailto:${restaurant.email}`} className="text-sm text-indigo-600">{restaurant.email}</a></div>}
              {restaurant.openingHours && (
                <div className="flex items-start space-x-2">
                  <span className="text-gray-500">🕒</span>
                  <div className="text-sm text-gray-700">
                    {Object.entries(restaurant.openingHours).map(([day, hours]: any) => (
                      <div key={day} className="flex justify-between"><span>{day}:</span><span>{hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}</span></div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setShowAbout(false)} className="w-full mt-2 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Compris !</button>
            </div>
          )}
        </div>

        {/* Add to Home Screen */}
        <div className="px-4 py-4 bg-gray-50 border-t">
          <button onClick={handleAddToHomeScreen} className="w-full py-4 bg-white border-2 border-indigo-200 rounded-xl text-indigo-700 font-medium flex items-center justify-center space-x-2 hover:bg-indigo-50 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Ajouter à l'écran d'accueil</span>
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">Powered by adam · Mentions légales</p>
        </div>
      </div>
    </div>
  );
}