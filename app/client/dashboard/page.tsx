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
  const [typedGreeting, setTypedGreeting] = useState("");
  const fullGreeting = "comment allez-vous aujourd'hui ?";

  // Typing animation effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullGreeting.length) {
        setTypedGreeting(fullGreeting.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Helper to get short ID from customerId
  const getShortId = () => {
    if (!client?.customerId) return "****";
    const parts = client.customerId.split("-");
    const lastPart = parts[parts.length - 1];
    return lastPart.slice(-4);
  };

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
    let clientId = localStorage.getItem("clientId");
    let clientName = localStorage.getItem("clientName");
    let storedRestaurantId = localStorage.getItem("restaurantId");

    if (clientId && clientName && storedRestaurantId) {
      fetchClientData(clientId);
      fetchRestaurantData(storedRestaurantId);
    } else {
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
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4"></div>
          <p className="text-gray-400">Chargement de votre carte...</p>
        </div>
      </div>
    );
  }

  if (!client || !restaurant) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erreur de chargement des données</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-[#fe5502] text-white rounded-lg hover:bg-[#e0682e] transition">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#0a1628]">
      <div className="max-w-md mx-auto bg-[#0d1f3c] min-h-screen shadow-2xl relative border-x border-[#1e3a5f]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#1e3a5f] bg-[#0d1f3c]/80 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={handleRefresh} className="p-2 hover:bg-[#1e3a5f] rounded-full transition-colors">
            <svg className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="flex-1 flex justify-center">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-full border border-[#fe5502]" />
            ) : (
              <div className="w-10 h-10 bg-[#fe5502] rounded-full flex items-center justify-center text-white font-bold">
                {restaurant.name?.charAt(0) || "R"}
              </div>
            )}
          </div>
          <button className="p-2 hover:bg-[#1e3a5f] rounded-full transition-colors relative">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Client Info with Typing Animation */}
        <div className="px-4 py-6 text-center border-b border-[#1e3a5f]">
          <h2 className="text-2xl font-bold text-white">{client.name}</h2>
          <p className="text-sm text-gray-400 mt-1">ID: #{getShortId()}</p>
          <p className="text-gray-300 mt-3 italic">
            Bonjour {client.name},{" "}
            <span className="inline-block min-w-[200px]">
              {typedGreeting}
              <span className="animate-pulse">|</span>
            </span>
          </p>
        </div>

        {/* Balance Section with gradient */}
        <div className="px-4 py-4 bg-gradient-to-r from-[#0a1628] to-[#1e3a5f] border-b border-[#1e3a5f]">
          <p className="text-sm text-gray-400">Votre solde est</p>
          <p className="text-3xl font-bold text-[#fe5502]">{client.points || 0} ⭐</p>
          <p className="text-xs text-gray-500 mt-1">1 DT = 10 ⭐</p>
        </div>

        {/* QR Code Button with modern style */}
        <div className="px-4 py-4 border-b border-[#1e3a5f]">
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full py-4 bg-[#fe5502] text-white rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-[#e0682e] transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <span>📱</span>
            <span>Mon Code QR</span>
          </button>
          {showQR && (
            <div className="mt-4 p-4 bg-[#0a1628] rounded-xl text-center border border-[#1e3a5f] animate-fadeIn">
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-lg shadow-inner flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-r from-[#fe5502] to-[#e0682e] flex flex-col items-center justify-center text-white text-xs rounded-lg">
                  <span className="text-lg font-bold">QR Code</span>
                  <span className="text-[10px] mt-2">{client.customerId}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Présentez ce code au staff</p>
            </div>
          )}
        </div>

        {/* Stars Progress Section */}
        <div className="px-4 py-4 border-b border-[#1e3a5f]">
          <h3 className="font-semibold text-white mb-3">Vos étoiles</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progression</span>
              <span className="font-medium text-[#fe5502]">{client.points || 0} ⭐</span>
            </div>
            <div className="w-full bg-[#1e3a5f] rounded-full h-3">
              <div
                className="bg-[#fe5502] rounded-full h-3 transition-all duration-500"
                style={{ width: `${Math.min((client.points || 0) / 500 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {rewards.map((reward: any) => (
              <div key={reward.id} className="text-center group">
                <div
                  className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                    (client.points || 0) >= reward.stars
                      ? 'bg-gradient-to-br from-[#fe5502] to-[#e0682e] text-white shadow-lg scale-105'
                      : 'bg-[#0a1628] border border-[#1e3a5f] text-gray-400'
                  }`}
                >
                  <span className="text-2xl">{reward.icon}</span>
                  <span className="text-xs font-medium mt-1">{reward.stars}⭐</span>
                </div>
                <p className="text-xs mt-1 text-gray-300 group-hover:text-[#fe5502] transition">{reward.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-[#1e3a5f]">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("rewards")}
              className={`flex-1 py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === "rewards"
                  ? "border-[#fe5502] text-[#fe5502]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              🎁 Récompenses
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex-1 py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === "coupons"
                  ? "border-[#fe5502] text-[#fe5502]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              🏷️ Coupons
            </button>
          </div>
        </div>

        {/* Tab Content with animations */}
        <div className="px-4 py-4 min-h-[200px] animate-fadeIn">
          {activeTab === "rewards" ? (
            <div className="space-y-3">
              <p className="text-sm text-green-400 font-medium mb-2">✨ Récompense disponible :</p>
              <div className="bg-[#0a1628] border border-[#1e3a5f] p-3 rounded-xl flex items-center justify-between hover:border-[#fe5502] transition-all">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">☕</span>
                  <div>
                    <p className="font-medium text-white">Café offert</p>
                    <p className="text-xs text-gray-400">100 ⭐ - Valable jusqu'au 30/06</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-[#fe5502] text-white text-sm rounded-lg hover:bg-[#e0682e] transition transform hover:scale-105">
                  Utiliser
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-4">🎯 Autres récompenses :</p>
              {rewards.slice(1).map((reward: any) => (
                <div key={reward.id} className="bg-[#0a1628] border border-[#1e3a5f] p-3 rounded-xl flex items-center justify-between opacity-70 hover:opacity-100 transition">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="font-medium text-white">{reward.name}</p>
                      <p className="text-xs text-gray-400">{reward.stars} ⭐</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {reward.stars - (client.points || 0)} ⭐ manquantes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.length > 0 ? (
                coupons.map((coupon: any) => (
                  <div key={coupon.id} className="border border-dashed border-[#fe5502] bg-[#0a1628] p-3 rounded-xl flex items-center justify-between hover:bg-[#1e3a5f] transition-all">
                    <div>
                      <p className="font-bold text-[#fe5502]">{coupon.name}</p>
                      <p className="text-xs text-gray-400">{coupon.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Valable jusqu'au {coupon.validUntil}</p>
                    </div>
                    <button className="px-3 py-1 bg-[#fe5502] text-white text-sm rounded-lg hover:bg-[#e0682e] transition transform hover:scale-105">
                      Activer
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Aucun coupon disponible</p>
              )}
            </div>
          )}
        </div>

        {/* About Restaurant */}
        <div className="px-4 py-2 border-t border-[#1e3a5f]">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="w-full py-3 border border-[#1e3a5f] rounded-xl text-gray-300 font-medium hover:bg-[#1e3a5f] transition flex items-center justify-center space-x-2"
          >
            <span>ℹ️</span>
            <span>À propos de {restaurant.name}</span>
          </button>
          {showAbout && (
            <div className="mt-4 p-4 bg-[#0a1628] rounded-xl space-y-3 border border-[#1e3a5f] animate-fadeIn">
              {restaurant.description && (
                <p className="text-sm text-gray-300">{restaurant.description}</p>
              )}
              {restaurant.address && (
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400">📍</span>
                  <p className="text-sm text-gray-300">{restaurant.address}</p>
                </div>
              )}
              {restaurant.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📞</span>
                  <a href={`tel:${restaurant.phoneNumber}`} className="text-sm text-[#fe5502] hover:underline">
                    {restaurant.phoneNumber}
                  </a>
                </div>
              )}
              {restaurant.email && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">✉️</span>
                  <a href={`mailto:${restaurant.email}`} className="text-sm text-[#fe5502] hover:underline">
                    {restaurant.email}
                  </a>
                </div>
              )}
              {restaurant.openingHours && (
                <div className="flex items-start space-x-2">
                  <span className="text-gray-400">🕒</span>
                  <div className="text-sm text-gray-300">
                    {Object.entries(restaurant.openingHours).map(([day, hours]: any) => (
                      <div key={day} className="flex justify-between gap-4">
                        <span>{day}:</span>
                        <span>{hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowAbout(false)}
                className="w-full mt-2 py-2 bg-[#1e3a5f] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#fe5502] hover:text-white transition"
              >
                Compris !
              </button>
            </div>
          )}
        </div>

        {/* Add to Home Screen */}
        <div className="px-4 py-4 bg-[#0a1628] border-t border-[#1e3a5f]">
          <button
            onClick={handleAddToHomeScreen}
            className="w-full py-4 bg-[#0d1f3c] border-2 border-[#fe5502] rounded-xl text-[#fe5502] font-medium flex items-center justify-center space-x-2 hover:bg-[#fe5502] hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Ajouter à l'écran d'accueil</span>
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">Powered by adam · Mentions légales</p>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}