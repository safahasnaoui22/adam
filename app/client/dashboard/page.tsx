"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react"; // install if not present: npm install qrcode.react

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

  // PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const defaultTheme = {
  colors: {
    primary: "#fe5502",
    background: "#ffffff",
    text: "#282424",
    accent: "#e0682e",
  },
};

const dynamicStyles = {
  primary: restaurant?.theme?.colors?.primary || defaultTheme.colors.primary,
  background: restaurant?.theme?.colors?.background || defaultTheme.colors.background,
  text: restaurant?.theme?.colors?.text || defaultTheme.colors.text,
  accent: restaurant?.theme?.colors?.accent || defaultTheme.colors.accent,
};
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

  // Helper to get short ID from customerId (with fallback)
  const getShortId = () => {
    if (client?.customerId && client.customerId.includes('-')) {
      const parts = client.customerId.split('-');
      const lastPart = parts[parts.length - 1];
      return lastPart.slice(-4);
    } else if (client?.id) {
      // fallback: use last 4 chars of internal id
      return client.id.slice(-4);
    }
    return "****";
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

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('SW registration failed', err));
    }
  }, []);

  // Capture beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const clientId = localStorage.getItem("clientId");
    if (clientId) {
      await fetchClientData(clientId);
    }
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAddToHomeScreen = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      // fallback instructions for browsers that don't support beforeinstallprompt
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        alert("Pour ajouter à l'écran d'accueil :\n1. Appuyez sur le bouton Partager\n2. Faites défiler vers le bas\n3. Appuyez sur 'Sur l'écran d'accueil'");
      } else {
        alert("Utilisez 'Ajouter à l'écran d'accueil' dans le menu du navigateur");
      }
    }
  };

  // Apply theme from restaurant (if any)
  const theme = restaurant?.theme || {};
  const primaryColor = theme.colors?.primary || "#fe5502";
  const secondaryColor = theme.colors?.secondary || "#e0682e";
  const bgColor = theme.colors?.background || "#0a1628";
  const cardBgColor = theme.colors?.cardBackground || "#0d1f3c";
  const textColor = theme.colors?.text || "#ffffff";
  const accentColor = theme.colors?.accent || primaryColor;

  // Build dynamic style object
  const dynamicStyles = {
    primary: primaryColor,
    secondary: secondaryColor,
    background: bgColor,
    cardBg: cardBgColor,
    text: textColor,
    accent: accentColor,
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

  // Get rewards from restaurant's loyalty program (no fallback)
  const rewards = restaurant.loyaltyProgram?.rewards?.length
    ? restaurant.loyaltyProgram.rewards.map((r: any) => ({
        id: r.id,
        name: r.name,
        stars: r.pointsRequired,
        icon: "🎁",
        description: r.description || ""
      }))
    : []; // No static fallback anymore

  const coupons = restaurant.coupons || []; // remove static coupons too

  // Calculate next reward for progress bar
  const sortedRewards = [...rewards].sort((a, b) => a.stars - b.stars);
  const nextReward = sortedRewards.find(r => r.stars > (client.points || 0));
  const currentProgress = nextReward ? (client.points / nextReward.stars) * 100 : 100;

  return (
    <div 
      className="min-h-screen" 
      style={{ backgroundColor: dynamicStyles.background }}
    >
      <div 
        className="max-w-md mx-auto min-h-screen shadow-2xl relative border-x" 
        style={{ 
          backgroundColor: dynamicStyles.cardBg,
          borderColor: `${dynamicStyles.primary}30`,
          color: dynamicStyles.text
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10 backdrop-blur-sm" style={{ borderColor: `${dynamicStyles.primary}30`, backgroundColor: `${dynamicStyles.cardBg}cc` }}>
          <button onClick={handleRefresh} className="p-2 rounded-full transition-colors hover:bg-opacity-20" style={{ color: dynamicStyles.text }}>
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="flex-1 flex justify-center">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-full border" style={{ borderColor: dynamicStyles.primary }} />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: dynamicStyles.primary }}>
                {restaurant.name?.charAt(0) || "R"}
              </div>
            )}
          </div>
          <button className="p-2 rounded-full transition-colors hover:bg-opacity-20" style={{ color: dynamicStyles.text }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {/* Client Info with Typing Animation */}
        <div className="px-4 py-6 text-center border-b" style={{ borderColor: `${dynamicStyles.primary}30` }}>
          <h2 className="text-2xl font-bold" style={{ color: dynamicStyles.text }}>{client.name}</h2>
          <p className="text-sm mt-1" style={{ color: `${dynamicStyles.text}99` }}>ID: #{getShortId()}</p>
          <p className="mt-3 italic" style={{ color: `${dynamicStyles.text}cc` }}>
            Bonjour {client.name},{" "}
            <span className="inline-block min-w-[200px]">
              {typedGreeting}
              <span className="animate-pulse">|</span>
            </span>
          </p>
        </div>

        {/* Balance Section with gradient */}
        <div className="px-4 py-4 border-b bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${dynamicStyles.background}, ${dynamicStyles.cardBg})`, borderColor: `${dynamicStyles.primary}30` }}>
          <p className="text-sm" style={{ color: `${dynamicStyles.text}99` }}>Votre solde est</p>
          <p className="text-3xl font-bold" style={{ color: dynamicStyles.primary }}>{client.points || 0} ⭐</p>
          <p className="text-xs mt-1" style={{ color: `${dynamicStyles.text}80` }}>1 DT = 10 ⭐</p>
        </div>

  
      {/* QR Code Button with real QR code (points to scan page) */}
<div className="px-4 py-4 border-b" style={{ borderColor: `${dynamicStyles.primary}30` }}>
  <button
    onClick={() => setShowQR(!showQR)}
    className="w-full py-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95"
    style={{ backgroundColor: dynamicStyles.primary, color: '#fff' }}
  >
    <span>📱</span>
    <span>Mon Code QR</span>
  </button>
  {showQR && (
    <div className="mt-4 p-4 rounded-xl text-center border animate-fadeIn" style={{ backgroundColor: dynamicStyles.background, borderColor: `${dynamicStyles.primary}30` }}>
      <div className="flex justify-center">
        <QRCodeSVG 
          value={`${window.location.origin}/scan/${client.customerId}`} 
          size={180} 
          bgColor="#ffffff" 
          fgColor={dynamicStyles.primary} 
          level="H" 
        />
      </div>
      <p className="text-xs mt-2" style={{ color: `${dynamicStyles.text}99` }}>Présentez ce code au staff</p>
    </div>
  )}
</div>

        {/* Stars Progress Section */}
        <div className="px-4 py-4 border-b" style={{ borderColor: `${dynamicStyles.primary}30` }}>
          <h3 className="font-semibold mb-3" style={{ color: dynamicStyles.text }}>Vos étoiles</h3>
          {nextReward ? (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: `${dynamicStyles.text}99` }}>Prochaine récompense: {nextReward.name}</span>
                <span className="font-medium" style={{ color: dynamicStyles.primary }}>{client.points || 0} / {nextReward.stars} ⭐</span>
              </div>
              <div className="w-full rounded-full h-3" style={{ backgroundColor: `${dynamicStyles.primary}30` }}>
                <div
                  className="rounded-full h-3 transition-all duration-500"
                  style={{ width: `${Math.min(currentProgress, 100)}%`, backgroundColor: dynamicStyles.primary }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: `${dynamicStyles.text}99` }}>Aucune récompense configurée pour le moment.</p>
          )}
          {/* Rewards grid */}
          {rewards.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {rewards.map((reward: any) => (
                <div key={reward.id} className="text-center group">
                  <div
                    className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                      (client.points || 0) >= reward.stars
                        ? 'shadow-lg scale-105'
                        : ''
                    }`}
                    style={{
                      backgroundColor: (client.points || 0) >= reward.stars ? dynamicStyles.primary : `${dynamicStyles.primary}20`,
                      border: `1px solid ${(client.points || 0) >= reward.stars ? dynamicStyles.primary : `${dynamicStyles.primary}40`}`,
                      color: (client.points || 0) >= reward.stars ? '#fff' : dynamicStyles.text,
                    }}
                  >
                    <span className="text-2xl">{reward.icon}</span>
                    <span className="text-xs font-medium mt-1">{reward.stars}⭐</span>
                  </div>
                  <p className="text-xs mt-1 group-hover:transition" style={{ color: `${dynamicStyles.text}cc` }}>{reward.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs (rewards/coupons) - rewards are already shown above, but we keep tabs for coupons */}
        {coupons.length > 0 && (
          <>
            <div className="px-4 py-2 border-b" style={{ borderColor: `${dynamicStyles.primary}30` }}>
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
            <div className="px-4 py-4 min-h-[200px] animate-fadeIn">
              {activeTab === "coupons" ? (
                <div className="space-y-3">
                  {coupons.map((coupon: any) => (
                    <div key={coupon.id} className="border border-dashed p-3 rounded-xl flex items-center justify-between" style={{ borderColor: dynamicStyles.primary, backgroundColor: `${dynamicStyles.primary}10` }}>
                      <div>
                        <p className="font-bold" style={{ color: dynamicStyles.primary }}>{coupon.name}</p>
                        <p className="text-xs" style={{ color: `${dynamicStyles.text}99` }}>{coupon.description}</p>
                        <p className="text-xs mt-1" style={{ color: `${dynamicStyles.text}80` }}>Valable jusqu'au {coupon.validUntil}</p>
                      </div>
                      <button className="px-3 py-1 text-white text-sm rounded-lg" style={{ backgroundColor: dynamicStyles.primary }}>Activer</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.length > 0 ? (
                    rewards.map((reward: any) => (
                      <div key={reward.id} className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: `${dynamicStyles.primary}10`, borderLeft: `4px solid ${dynamicStyles.primary}` }}>
                        <div>
                          <p className="font-medium" style={{ color: dynamicStyles.text }}>{reward.name}</p>
                          <p className="text-xs" style={{ color: `${dynamicStyles.text}99` }}>{reward.stars} points requis</p>
                          {reward.description && <p className="text-xs text-gray-400">{reward.description}</p>}
                        </div>
                        {client.points >= reward.stars && (
                          <button className="px-3 py-1 rounded-lg text-sm" style={{ backgroundColor: dynamicStyles.primary, color: '#fff' }}>Échanger</button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center" style={{ color: `${dynamicStyles.text}99` }}>Aucune récompense configurée.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* About Restaurant */}
        <div className="px-4 py-2 border-t" style={{ borderColor: `${dynamicStyles.primary}30` }}>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="w-full py-3 border rounded-xl font-medium flex items-center justify-center space-x-2 transition hover:bg-opacity-20"
            style={{ borderColor: `${dynamicStyles.primary}50`, color: dynamicStyles.text }}
          >
            <span>ℹ️</span>
            <span>À propos de {restaurant.name}</span>
          </button>
          {showAbout && (
            <div className="mt-4 p-4 rounded-xl space-y-3 border animate-fadeIn" style={{ backgroundColor: dynamicStyles.background, borderColor: `${dynamicStyles.primary}30` }}>
              {restaurant.description && (
                <p className="text-sm" style={{ color: dynamicStyles.text }}>{restaurant.description}</p>
              )}
              {restaurant.address && (
                <div className="flex items-start space-x-2">
                  <span>📍</span>
                  <p className="text-sm" style={{ color: dynamicStyles.text }}>{restaurant.address}</p>
                </div>
              )}
              {restaurant.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <a href={`tel:${restaurant.phoneNumber}`} className="text-sm" style={{ color: dynamicStyles.primary }}>{restaurant.phoneNumber}</a>
                </div>
              )}
              {restaurant.email && (
                <div className="flex items-center space-x-2">
                  <span>✉️</span>
                  <a href={`mailto:${restaurant.email}`} className="text-sm" style={{ color: dynamicStyles.primary }}>{restaurant.email}</a>
                </div>
              )}
              {restaurant.openingHours && (
                <div className="flex items-start space-x-2">
                  <span>🕒</span>
                  <div className="text-sm">
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
                className="w-full mt-2 py-2 rounded-lg text-sm font-medium transition"
                style={{ backgroundColor: `${dynamicStyles.primary}20`, color: dynamicStyles.text }}
              >
                Compris !
              </button>
            </div>
          )}
        </div>

        {/* Add to Home Screen */}
        <div className="px-4 py-4 border-t" style={{ borderColor: `${dynamicStyles.primary}30`, backgroundColor: dynamicStyles.background }}>
          <button
            onClick={handleAddToHomeScreen}
            className="w-full py-4 border-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-95"
            style={{ borderColor: dynamicStyles.primary, color: dynamicStyles.primary, backgroundColor: `${dynamicStyles.primary}10` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Ajouter à l'écran d'accueil</span>
          </button>
          <p className="text-xs text-center mt-3" style={{ color: `${dynamicStyles.text}80` }}>Powered by adam · Mentions légales</p>
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