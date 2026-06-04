"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { getPatternStyle } from "@/lib/patterns";
import SpinWheel from "@/components/SpinWheel";
// ── Icon components ───────────────────────────────────────────────────
const IconGoogleMaps = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
    <circle cx="12" cy="9" r="2.5" fill="white"/>
  </svg>
);

const IconFacebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2"/>
    <path d="M16 8h-2a1 1 0 00-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 014-4h2v3z" fill="white"/>
  </svg>
);

const IconInstagram = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad-db" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80"/>
        <stop offset="25%" stopColor="#FCAF45"/>
        <stop offset="50%" stopColor="#F77737"/>
        <stop offset="75%" stopColor="#C13584"/>
        <stop offset="100%" stopColor="#833AB4"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-db)"/>
    <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="16.5" cy="7.5" r="0.8" fill="white"/>
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#000"/>
    <path d="M18 6L13.5 11.5L18.5 18H15.5L12 13.5L8 18H5.5L10.5 12L5.5 6H8.5L12 10L15.5 6H18Z" fill="white"/>
  </svg>
);

const IconCheck = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconStar = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconExternalLink = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────
type BonusAction = {
  id: string;
  label: string;
  urlKey: keyof RestaurantBonusUrls;
  starsKey: keyof RestaurantBonusStars;
  icon: React.ReactNode;
  hint: string;
  actionLabel: string; // what the user should do (for the modal)
};

interface RestaurantBonusUrls {
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

interface RestaurantBonusStars {
  googleMapsBonusStars: number;
  facebookBonusStars: number;
  instagramBonusStars: number;
  twitterBonusStars: number;
}

const BONUS_ACTIONS: BonusAction[] = [
  {
    id: "googleMaps",
    label: "Google Maps",
    urlKey: "googleMapsUrl",
    starsKey: "googleMapsBonusStars",
    icon: <IconGoogleMaps size={20} />,
    hint: "Laissez un avis 5⭐ sur Google Maps",
    actionLabel: "Laisser un avis 5 étoiles",
  },
  {
    id: "facebook",
    label: "Facebook",
    urlKey: "facebookUrl",
    starsKey: "facebookBonusStars",
    icon: <IconFacebook size={20} />,
    hint: "Likez & suivez notre page",
    actionLabel: "Liker et suivre la page",
  },
  {
    id: "instagram",
    label: "Instagram",
    urlKey: "instagramUrl",
    starsKey: "instagramBonusStars",
    icon: <IconInstagram size={20} />,
    hint: "Suivez-nous sur Instagram",
    actionLabel: "Suivre le compte",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    urlKey: "twitterUrl",
    starsKey: "twitterBonusStars",
    icon: <IconX size={20} />,
    hint: "Suivez notre compte X",
    actionLabel: "Suivre le compte X",
  },
];

// ── Bonus Modal Component ─────────────────────────────────────────────
type BonusModalProps = {
  action: BonusAction;
  pointsValue: number;
  primaryColor: string;
  textColor: string;
  cardBg: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
};

function BonusModal({
  action,
  pointsValue,
  primaryColor,
  textColor,
  cardBg,
  onConfirm,
  onCancel,
  loading,
}: BonusModalProps) {
  const [step, setStep] = useState<"intro" | "waiting" | "confirm">("intro");
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOpenLink = () => {
    setStep("waiting");
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStep("confirm");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    // Overlay — uses normal-flow wrapper to avoid fixed positioning
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px",
          width: "100%",
          maxWidth: "448px",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: `${textColor}20`, margin: "0 auto 20px" }} />

        {/* Step: intro */}
        {step === "intro" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: `${primaryColor}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              {action.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>
              Gagnez des points sur {action.label}
            </h3>
            <p style={{ fontSize: 13, color: `${textColor}80`, margin: "0 0 6px", lineHeight: 1.5 }}>
              {action.actionLabel} pour gagner
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: `${primaryColor}15`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
              <IconStar size={14} color={primaryColor} />
              <span style={{ fontSize: 15, fontWeight: 700, color: primaryColor }}>+{pointsValue} points</span>
            </div>

            <div style={{ backgroundColor: `${textColor}06`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "left" }}>
              <p style={{ fontSize: 12, color: `${textColor}60`, margin: 0, lineHeight: 1.6 }}>
                1. Appuyez sur <strong style={{ color: textColor }}>Ouvrir {action.label}</strong><br/>
                2. {action.actionLabel}<br/>
                3. Revenez ici et confirmez
              </p>
            </div>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open((window as any).__bonusUrl, "_blank");
                handleOpenLink();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "14px",
                backgroundColor: primaryColor,
                color: "#fff",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              <IconExternalLink size={16} color="#fff" />
              Ouvrir {action.label}
            </a>
            <button
              onClick={onCancel}
              style={{ width: "100%", padding: "12px", backgroundColor: "transparent", border: "none", color: `${textColor}60`, fontSize: 14, cursor: "pointer" }}
            >
              Annuler
            </button>
          </div>
        )}

        {/* Step: waiting (countdown) */}
        {step === "waiting" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${primaryColor}30`, borderTopColor: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: primaryColor }}>{countdown}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>
              En cours…
            </h3>
            <p style={{ fontSize: 13, color: `${textColor}70`, margin: "0 0 20px" }}>
              Effectuez l'action sur {action.label},<br/>puis revenez ici.
            </p>
            <button
              onClick={() => setStep("confirm")}
              style={{
                width: "100%", padding: "13px",
                backgroundColor: `${primaryColor}15`,
                border: `1.5px solid ${primaryColor}30`,
                borderRadius: 14, color: primaryColor,
                fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}
            >
              J'ai déjà terminé →
            </button>
          </div>
        )}

        {/* Step: confirm */}
        {step === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>
              Avez-vous bien effectué l'action ?
            </h3>
            <p style={{ fontSize: 13, color: `${textColor}70`, margin: "0 0 24px", lineHeight: 1.5 }}>
              Confirmez que vous avez <strong>{action.actionLabel.toLowerCase()}</strong> sur {action.label}.
            </p>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                backgroundColor: primaryColor,
                border: "none", borderRadius: 14,
                color: "#fff", fontWeight: 700,
                fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginBottom: 10,
              }}
            >
              {loading ? "Enregistrement…" : `✅ Oui, j'ai ${action.actionLabel.toLowerCase()} !`}
            </button>
            <button
              onClick={onCancel}
              style={{ width: "100%", padding: "12px", backgroundColor: "transparent", border: "none", color: `${textColor}60`, fontSize: 14, cursor: "pointer" }}
            >
              Non, annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [patternStyle, setPatternStyle] = useState<React.CSSProperties>({});
  const [completedBonuses, setCompletedBonuses] = useState<string[]>([]);
  const [claimingBonus, setClaimingBonus] = useState<string | null>(null);
  // Modal state
  const [activeBonusModal, setActiveBonusModal] = useState<BonusAction | null>(null);

  // Swiper state
  const [swiperOffset, setSwiperOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const VISIBLE_CARDS = 3;

  const fullGreeting = "comment allez-vous aujourd'hui ?";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullGreeting.length) {
        setTypedGreeting(fullGreeting.slice(0, i));
        i++;
      } else clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getShortId = () => {
    if (client?.customerId?.includes("-")) {
      const parts = client.customerId.split("-");
      return parts[parts.length - 1].slice(-4);
    }
    return client?.id?.slice(-4) ?? "****";
  };

  const fetchClientData = async (id: string) => {
    try {
      const res = await fetch(`/api/client/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClient(data);
        if (data.completedBonuses && Array.isArray(data.completedBonuses)) {
          setCompletedBonuses(data.completedBonuses);
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchRestaurantData = async (id: string) => {
    try {
      const res = await fetch(`/api/restaurant/${id}`);
      const data = await res.json();
      if (res.ok) setRestaurant(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const clientId = localStorage.getItem("clientId");
    const clientName = localStorage.getItem("clientName");
    const storedRestaurantId = localStorage.getItem("restaurantId");
    if (clientId && clientName && storedRestaurantId) {
      fetchClientData(clientId);
      fetchRestaurantData(storedRestaurantId);
    } else {
      router.push(`/client/login?restaurantId=${restaurantId || ""}`);
    }
  }, [restaurantId, router]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const clientId = localStorage.getItem("clientId");
        const storedRestaurantId = localStorage.getItem("restaurantId");
        if (clientId) fetchClientData(clientId);
        if (storedRestaurantId) fetchRestaurantData(storedRestaurantId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const clientId = localStorage.getItem("clientId");
    const storedRestaurantId = localStorage.getItem("restaurantId");
    if (clientId) await fetchClientData(clientId);
    if (storedRestaurantId) await fetchRestaurantData(storedRestaurantId);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAddToHomeScreen = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
      alert("Pour ajouter à l'écran d'accueil :\n1. Appuyez sur le bouton Partager\n2. Appuyez sur 'Sur l'écran d'accueil'");
    } else {
      alert("Utilisez 'Ajouter à l'écran d'accueil' dans le menu du navigateur");
    }
  };

  // ── Open bonus modal ──────────────────────────────────────────────
  const handleOpenBonusModal = (action: BonusAction) => {
    if (completedBonuses.includes(action.id)) return;
    if (!restaurant?.[action.urlKey]) {
      alert("Ce lien n'est pas encore configuré par le restaurant.");
      return;
    }
    // Store the URL on window so the modal can access it without prop drilling issues
    (window as any).__bonusUrl = restaurant[action.urlKey];
    setActiveBonusModal(action);
  };

  // ── Confirm bonus (called after user says "yes I did it") ─────────
  const handleConfirmBonus = async () => {
    if (!activeBonusModal) return;
    setClaimingBonus(activeBonusModal.id);
    try {
      const res = await fetch("/api/client/claim-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeBonusModal.id,
          restaurantId: restaurant.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setClient((prev: any) => ({ ...prev, points: data.newPoints }));
        setCompletedBonuses((prev) => [...prev, activeBonusModal.id]);
        setActiveBonusModal(null);
        // Small delay for the modal to close before showing success
        setTimeout(() => {
          alert(`🎉 Félicitations ! Vous avez gagné ${data.pointsEarned} points.`);
        }, 300);
      } else {
        alert(data.error || "Une erreur est survenue. Réessayez plus tard.");
        setActiveBonusModal(null);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau. Vérifiez votre connexion.");
      setActiveBonusModal(null);
    } finally {
      setClaimingBonus(null);
    }
  };

  useEffect(() => {
    if (restaurant) {
      try {
        setPatternStyle(getPatternStyle(restaurant.backgroundPattern || "none"));
      } catch { setPatternStyle({}); }
    }
  }, [restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f9fafb" }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4" />
          <p style={{ color: "#6b7280", fontFamily: "'Inter', sans-serif" }}>Chargement de votre carte...</p>
        </div>
      </div>
    );
  }

  if (!client || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f9fafb" }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur de chargement des données</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-[#fe5502] text-white rounded-lg">Réessayer</button>
        </div>
      </div>
    );
  }

  const theme = restaurant?.theme || {};
  const primaryColor = theme.colors?.primary || "#fe5502";
  const secondaryColor = theme.colors?.secondary || "#e0682e";
  const bgColor = theme.colors?.background || "#ffffff";
  const cardBgColor = theme.colors?.cardBackground || "#ffffff";
  const textColor = theme.colors?.text || "#1f2937";

  const D = {
    primary: primaryColor,
    secondary: secondaryColor,
    background: bgColor,
    cardBg: cardBgColor,
    text: textColor,
  };

  let rewards: any[] = [];
  try {
    rewards = restaurant.loyaltyProgram?.rewards
      ?.filter((r: any) => r.isActive)
      ?.map((r: any) => ({
        id: r.id,
        name: r.name,
        pts: r.pointsRequired,
        description: r.description || "",
      }))
      ?.sort((a: any, b: any) => a.pts - b.pts) || [];
  } catch { rewards = []; }

  const coupons = restaurant.coupons || [];
  const clientPts = client.points || 0;
  const nextReward = rewards.find((r) => r.pts > clientPts);
  const progress = nextReward ? Math.min((clientPts / nextReward.pts) * 100, 100) : 100;
  const pointsToNext = nextReward ? nextReward.pts - clientPts : 0;
  const showAlert = nextReward && pointsToNext <= 50;
  const maxOffset = Math.max(0, rewards.length - VISIBLE_CARDS);

  const rewardEmoji = (pts: number) => {
    if (pts <= 100) return "☕";
    if (pts <= 200) return "🍰";
    if (pts <= 300) return "🏷️";
    if (pts <= 500) return "🍽️";
    if (pts <= 700) return "🎀";
    return "👑";
  };

  const availableBonuses = BONUS_ACTIONS.filter((action) => restaurant[action.urlKey]);
  const completedCount = availableBonuses.filter((a) => completedBonuses.includes(a.id)).length;
  const totalBonusPoints = availableBonuses.reduce((sum, a) => sum + (restaurant[a.starsKey] || 0), 0);
  const earnedBonusPoints = availableBonuses
    .filter((a) => completedBonuses.includes(a.id))
    .reduce((sum, a) => sum + (restaurant[a.starsKey] || 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: D.background, fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Bonus Modal ── */}
      {activeBonusModal && (
        <BonusModal
          action={activeBonusModal}
          pointsValue={restaurant[activeBonusModal.starsKey] || 0}
          primaryColor={D.primary}
          textColor={D.text}
          cardBg={D.cardBg}
          onConfirm={handleConfirmBonus}
          onCancel={() => setActiveBonusModal(null)}
          loading={claimingBonus === activeBonusModal.id}
        />
      )}

      <div
        className="max-w-md mx-auto min-h-screen shadow-lg relative border-x"
        style={{ backgroundColor: D.cardBg, ...patternStyle, borderColor: `${D.primary}20`, color: D.text }}
      >
        {/* ── Sticky top ── */}
        <div className="sticky top-0 z-20" style={{ backgroundColor: D.cardBg }}>
          {showAlert && (
            <div
              className="mx-3 mt-3 px-4 py-2 rounded-xl flex items-center gap-2 animate-fadeIn"
              style={{ backgroundColor: `${D.primary}15`, border: `1px solid ${D.primary}40` }}
            >
              <span className="text-lg">🎯</span>
              <p className="text-xs font-medium" style={{ color: D.primary }}>
                Plus que <strong>{pointsToNext} pts</strong> pour débloquer &ldquo;{nextReward!.name}&rdquo; !
              </p>
            </div>
          )}
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: `${D.primary}20` }}>
            <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Actualiser">
              <svg className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke={D.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="flex-1 flex justify-center">
              {restaurant.logo ? (
                <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-full border" style={{ borderColor: D.primary }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: D.primary }}>
                  {restaurant.name?.charAt(0) || "R"}
                </div>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke={D.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Client info ── */}
        <div className="px-4 py-6 text-center border-b" style={{ borderColor: `${D.primary}20` }}>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: D.text }}>{client.name}</h2>
          <p className="text-xs mt-1 font-medium tracking-wider uppercase" style={{ color: `${D.text}70` }}>ID #{getShortId()}</p>
          <p className="mt-3 text-sm italic" style={{ color: `${D.text}cc` }}>
            Bonjour {client.name},{" "}
            <span className="inline-block min-w-[200px]">{typedGreeting}<span className="animate-pulse">|</span></span>
          </p>
        </div>

        {/* ── Balance ── */}
        <div className="px-4 py-5 border-b" style={{ borderColor: `${D.primary}20`, backgroundColor: `${D.primary}08` }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: `${D.text}60` }}>Votre solde</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold tracking-tight" style={{ color: D.primary }}>{clientPts}</p>
            <p className="text-lg font-medium" style={{ color: `${D.primary}90` }}>points</p>
          </div>
          <p className="text-xs mt-1 font-medium" style={{ color: `${D.text}50` }}>1 DT dépensé = 10 points gagnés</p>
        </div>

        {/* ── QR ── */}
        <div className="px-4 py-4 border-b" style={{ borderColor: `${D.primary}20` }}>
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95 text-sm"
            style={{ backgroundColor: D.primary, color: "#fff", letterSpacing: "0.01em" }}
          >
            <span>📱</span><span>Mon Code QR</span>
          </button>
          {showQR && (
            <div className="mt-4 p-5 rounded-2xl text-center border animate-fadeIn" style={{ backgroundColor: D.background, borderColor: `${D.primary}20` }}>
              <div className="flex justify-center">
                <QRCodeSVG value={`${window.location.origin}/scan/${client.customerId}`} size={180} bgColor="#ffffff" fgColor={D.primary} level="H" />
              </div>
              <p className="text-xs mt-3 font-medium" style={{ color: `${D.text}70` }}>Présentez ce code au staff</p>
            </div>
          )}
        </div>

        {/* ── Rewards Swiper ── */}
        <div className="px-4 py-5 border-b" style={{ borderColor: `${D.primary}20` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold tracking-tight" style={{ color: D.text }}>Vos récompenses</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${D.primary}15`, color: D.primary }}>
              {clientPts} pts
            </span>
          </div>

          {nextReward && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium" style={{ color: `${D.text}70` }}>
                  Prochain palier : <span style={{ color: D.text, fontWeight: 600 }}>{nextReward.name}</span>
                </p>
                <p className="text-xs font-semibold" style={{ color: D.primary }}>{clientPts} / {nextReward.pts}</p>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${D.primary}20` }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: D.primary }} />
              </div>
            </div>
          )}

          {rewards.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: `${D.text}60` }}>Aucune récompense configurée.</p>
          ) : (
            <>
              <div
                className="overflow-hidden"
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (dx < -40 && swiperOffset < maxOffset) setSwiperOffset(o => o + 1);
                  if (dx > 40 && swiperOffset > 0) setSwiperOffset(o => o - 1);
                  touchStartX.current = null;
                }}
              >
                <div
                  className="flex gap-3 pb-2 pt-1"
                  style={{ transform: `translateX(-${swiperOffset * (110 + 12)}px)`, transition: "transform 0.4s cubic-bezier(.4,0,.2,1)" }}
                >
                  {rewards.map((reward, i) => {
                    const unlocked = clientPts >= reward.pts;
                    return (
                      <div
                        key={reward.id}
                        className="flex-shrink-0 flex flex-col items-center gap-2 rounded-2xl p-3 transition-all"
                        style={{
                          minWidth: "110px",
                          backgroundColor: unlocked ? `${D.primary}12` : D.cardBg,
                          border: `1.5px solid ${unlocked ? D.primary : `${D.text}15`}`,
                          animation: unlocked ? `popIn 0.35s ease ${i * 0.06}s both` : "none",
                        }}
                      >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative" style={{ backgroundColor: unlocked ? `${D.primary}20` : `${D.text}08` }}>
                          <span>{rewardEmoji(reward.pts)}</span>
                          <div
                            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: unlocked ? D.primary : "#9ca3af", border: `2px solid ${D.cardBg}` }}
                          >
                            {unlocked ? (
                              <IconCheck size={10} color="#fff" />
                            ) : (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-center leading-tight" style={{ color: unlocked ? D.primary : D.text }}>{reward.name}</p>
                        <p className="text-xs font-medium" style={{ color: unlocked ? `${D.primary}90` : `${D.text}50` }}>{reward.pts} pts</p>
                        {unlocked && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: D.primary, color: "#fff" }}>Disponible</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {maxOffset > 0 && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button onClick={() => setSwiperOffset(o => Math.max(0, o - 1))} disabled={swiperOffset === 0} className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ border: `1px solid ${D.text}25`, color: D.text }}>‹</button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: maxOffset + 1 }).map((_, i) => (
                      <div key={i} onClick={() => setSwiperOffset(i)} className="h-1.5 rounded-full cursor-pointer transition-all duration-300" style={{ width: i === swiperOffset ? "16px" : "6px", backgroundColor: i === swiperOffset ? D.primary : `${D.text}25` }} />
                    ))}
                  </div>
                  <button onClick={() => setSwiperOffset(o => Math.min(maxOffset, o + 1))} disabled={swiperOffset >= maxOffset} className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ border: `1px solid ${D.text}25`, color: D.text }}>›</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Points à gagner ── */}
        {availableBonuses.length > 0 && (
          <div className="px-4 py-5 border-b" style={{ borderColor: `${D.primary}20` }}>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconStar size={16} color={D.primary} />
                <h3 className="text-base font-semibold tracking-tight" style={{ color: D.text }}>Points à gagner</h3>
              </div>
              {/* Progress pill */}
              {completedCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${D.primary}15`, color: D.primary }}>
                  +{earnedBonusPoints} / {totalBonusPoints} pts
                </span>
              )}
            </div>

            {/* Mini progress bar if some completed */}
            {availableBonuses.length > 1 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: `${D.text}60` }}>
                  <span>{completedCount} / {availableBonuses.length} actions complétées</span>
                  {completedCount === availableBonuses.length && <span style={{ color: D.primary }}>🎉 Tout complété !</span>}
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${D.primary}20` }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(completedCount / availableBonuses.length) * 100}%`, backgroundColor: D.primary }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {availableBonuses.map((bonus) => {
                const isCompleted = completedBonuses.includes(bonus.id);
                const pointsValue = restaurant[bonus.starsKey] || 0;
                return (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between p-3 rounded-xl border transition-all"
                    style={{
                      borderColor: isCompleted ? `${D.primary}30` : `${D.text}15`,
                      backgroundColor: isCompleted ? `${D.primary}05` : D.cardBg,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isCompleted ? `${D.primary}15` : `${D.primary}10` }}
                      >
                        {bonus.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: isCompleted ? `${D.text}80` : D.text }}>
                          {bonus.label}
                        </p>
                        <p className="text-xs" style={{ color: `${D.text}55` }}>{bonus.hint}</p>
                        {!isCompleted && (
                          <p className="text-[11px] font-semibold mt-0.5" style={{ color: D.primary }}>+{pointsValue} points</p>
                        )}
                        {isCompleted && (
                          <p className="text-[11px] font-semibold mt-0.5" style={{ color: `${D.primary}80` }}>+{pointsValue} pts gagnés ✓</p>
                        )}
                      </div>
                    </div>

                    {isCompleted ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${D.primary}15` }}
                      >
                        <IconCheck size={14} color={D.primary} />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenBonusModal(bonus)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                        style={{ backgroundColor: D.primary, color: "#fff" }}
                      >
                        Gagner
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-center mt-3" style={{ color: `${D.text}40` }}>
              ✨ Chaque action n'est récompensée qu'une seule fois.
            </p>
          </div>
        )}

        {/* ── Coupons tab ── */}
        {coupons.length > 0 && (
          <>
            <div className="px-4 py-2 border-b" style={{ borderColor: `${D.primary}20` }}>
              <div className="flex space-x-4">
                {["rewards", "coupons"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2 font-semibold text-sm border-b-2 transition-all"
                    style={{
                      borderColor: activeTab === tab ? D.primary : "transparent",
                      color: activeTab === tab ? D.primary : `${D.text}60`,
                    }}
                  >
                    {tab === "rewards" ? "🎁 Récompenses" : "🏷️ Coupons"}
                  </button>
                ))}
              </div>
            </div>
            {activeTab === "coupons" && (
              <div className="px-4 py-4 space-y-3 animate-fadeIn">
                {coupons.map((coupon: any) => (
                  <div key={coupon.id} className="border border-dashed p-3 rounded-2xl flex items-center justify-between" style={{ borderColor: D.primary, backgroundColor: `${D.primary}08` }}>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: D.primary }}>{coupon.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: `${D.text}80` }}>{coupon.description}</p>
                      <p className="text-xs mt-1" style={{ color: `${D.text}60` }}>Valable jusqu'au {coupon.validUntil}</p>
                    </div>
                    <button className="px-3 py-1.5 text-white text-xs font-semibold rounded-xl" style={{ backgroundColor: D.primary }}>Activer</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── About ── */}
        <div className="px-4 py-3 border-t" style={{ borderColor: `${D.primary}20` }}>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="w-full py-3 border rounded-2xl font-medium text-sm flex items-center justify-center space-x-2 transition hover:opacity-80"
            style={{ borderColor: `${D.primary}30`, color: D.text }}
          >
            <span>ℹ️</span><span>À propos de {restaurant.name}</span>
          </button>
          {showAbout && (
            <div className="mt-3 p-4 rounded-2xl space-y-3 border animate-fadeIn" style={{ backgroundColor: D.background, borderColor: `${D.primary}20` }}>
              {restaurant.description && <p className="text-sm" style={{ color: D.text }}>{restaurant.description}</p>}
              {restaurant.address && (
                <div className="flex items-start gap-2"><span>📍</span><p className="text-sm" style={{ color: D.text }}>{restaurant.address}</p></div>
              )}
              {restaurant.phoneNumber && (
                <div className="flex items-center gap-2"><span>📞</span><a href={`tel:${restaurant.phoneNumber}`} className="text-sm font-medium" style={{ color: D.primary }}>{restaurant.phoneNumber}</a></div>
              )}
              {restaurant.email && (
                <div className="flex items-center gap-2"><span>✉️</span><a href={`mailto:${restaurant.email}`} className="text-sm font-medium" style={{ color: D.primary }}>{restaurant.email}</a></div>
              )}
              {restaurant.openingHours && (
                <div className="flex items-start gap-2">
                  <span>🕒</span>
                  <div className="text-sm space-y-0.5">
                    {Object.entries(restaurant.openingHours).map(([day, hours]: any) => (
                      <div key={day} className="flex justify-between gap-6">
                        <span style={{ color: `${D.text}70` }}>{day}</span>
                        <span style={{ color: D.text }}>{hours.closed ? "Fermé" : `${hours.open} – ${hours.close}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setShowAbout(false)} className="w-full mt-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: `${D.primary}12`, color: D.primary }}>Compris !</button>
            </div>
          )}
        </div>

        {/* ── How to earn ── */}
        <div className="px-4 pt-4 pb-2 border-t" style={{ borderColor: `${D.primary}20` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-center" style={{ color: `${D.text}50` }}>Kiféch nerba7 ? 🤔</p>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${D.primary}18` }}>
            {[
              { emoji: "🍔", step: "1. Koul w khalles", desc: "Pour chaque 1 DT payé, on t'offre 10 points direct sur ton téléphone !", shade: `${D.primary}0a` },
              { emoji: "📱", step: "2. Scanni Codek", desc: 'Wa9t lkhlas, appuie sur "Mon Code QR" et passe ton téléphone à la caisse.', shade: `${D.primary}06` },
              { emoji: "🎁", step: "3. Hizz l'gratuit !", desc: "Dès que ta jauge touche un cadeau, demande ta récompense gratuite !", shade: `${D.primary}0a` },
            ].map((item, idx, arr) => (
              <div key={idx}>
                <div className="flex items-start gap-4 px-4 py-4" style={{ backgroundColor: item.shade }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: `${D.primary}20` }}>{item.emoji}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: D.text }}>{item.step}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: `${D.text}70` }}>{item.desc}</p>
                  </div>
                </div>
                {idx < arr.length - 1 && <div className="h-px" style={{ backgroundColor: `${D.primary}12` }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── Add to home screen ── */}
        <div className="px-4 py-5 border-t" style={{ borderColor: `${D.primary}20`, backgroundColor: D.background }}>
          <button
            onClick={handleAddToHomeScreen}
            className="w-full py-4 border-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ borderColor: D.primary, color: D.primary, backgroundColor: `${D.primary}0d` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Ajouter à l'écran d'accueil
          </button>
          <p className="text-xs text-center mt-3" style={{ color: `${D.text}50` }}>Powered by adam · Mentions légales</p>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}