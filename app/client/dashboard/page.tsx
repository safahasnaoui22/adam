"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { getPatternStyle } from "@/lib/patterns";

// ── useScrollReveal hook ───────────────────────────────────────────────
function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

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
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
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

const IconQR = ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="5" y="5" width="3" height="3" fill={color} stroke="none"/>
    <rect x="16" y="5" width="3" height="3" fill={color} stroke="none"/>
    <rect x="5" y="16" width="3" height="3" fill={color} stroke="none"/>
    <path d="M14 14h3v3"/>
    <path d="M17 17v4"/>
    <path d="M21 14v3h-4"/>
  </svg>
);

const IconBell = ({ size = 20, color = "currentColor", active = false, pulsing = false }: { size?: number; color?: string; active?: boolean; pulsing?: boolean }) => (
  <span style={{ position: "relative", display: "inline-flex" }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
    {active && (
      <span style={{
        position: "absolute",
        top: 0, right: 0,
        width: 8, height: 8,
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        border: "1.5px solid white",
        animation: pulsing ? "bellDot 1.8s ease-in-out infinite" : "none",
      }}/>
    )}
  </span>
);

const IconGiftCard = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
);

const IconPointsCoin = ({ size = 36, primaryColor }: { size?: number; primaryColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="17" fill={primaryColor} opacity="0.15"/>
    <circle cx="18" cy="18" r="17" stroke={primaryColor} strokeWidth="1.5" fill="none"/>
    <circle cx="18" cy="18" r="13" fill={primaryColor} opacity="0.2"/>
    <text x="18" y="23" textAnchor="middle" fontSize="16" fontWeight="700" fontFamily="'Inter', system-ui, sans-serif" fill={primaryColor}>$</text>
    <path d="M11 11 Q14 9 17 10" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// ── iOS/Android detection ─────────────────────────────────────────────
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (window.navigator as any).standalone === true || 
    window.matchMedia("(display-mode: standalone)").matches;
}

// ── iOS Install Guide Modal ───────────────────────────────────────────
function IOSInstallModal({ primaryColor, textColor, cardBg, onClose }: {
  primaryColor: string; textColor: string; cardBg: string; onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: cardBg,
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 44px",
          width: "100%", maxWidth: "448px",
          animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: `${textColor}20`, margin: "0 auto 24px" }}/>
        
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: `${primaryColor}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 32,
          }}>📲</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>
            Ajouter à l'écran d'accueil
          </h3>
          <p style={{ fontSize: 13, color: `${textColor}70`, margin: 0, lineHeight: 1.5 }}>
            Suivez ces 2 étapes dans Safari pour accéder à votre carte fidélité en un clic.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {/* Step 1 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            backgroundColor: `${primaryColor}08`,
            borderRadius: 16, padding: "14px 16px",
            border: `1px solid ${primaryColor}18`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: primaryColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 18 }}>1</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: textColor, margin: "0 0 3px" }}>
                Appuyez sur le bouton Partager
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: `${textColor}60` }}>En bas de l'écran Safari :</span>
                {/* Safari share icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            backgroundColor: `${primaryColor}08`,
            borderRadius: 16, padding: "14px 16px",
            border: `1px solid ${primaryColor}18`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: primaryColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 18 }}>2</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: textColor, margin: "0 0 3px" }}>
                "Sur l'écran d'accueil"
              </p>
              <p style={{ fontSize: 11, color: `${textColor}60`, margin: 0 }}>
                Faites défiler et appuyez sur ce bouton
              </p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              border: "1px solid #e5e7eb",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <line x1="14" y1="14" x2="21" y2="14"/>
                <line x1="14" y1="17.5" x2="21" y2="17.5"/>
                <line x1="14" y1="21" x2="21" y2="21"/>
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "15px",
            backgroundColor: primaryColor,
            border: "none", borderRadius: 16,
            color: "#fff", fontWeight: 700, fontSize: 16,
            cursor: "pointer",
          }}
        >
          J'ai compris !
        </button>
      </div>
    </div>
  );
}

// ── Push Notification helpers ─────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

async function subscribeToPush(clientId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    // Wait for SW to be fully ready
    const registration = await navigator.serviceWorker.ready;

    // Unsubscribe any stale subscription first
    const existing = await registration.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON(), clientId }),
    });

    if (!res.ok) {
      console.error("[push] subscribe API failed:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[push] subscribe error:", err);
    return false;
  }
}

async function unsubscribeFromPush(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
  } catch (err) {
    console.error("[push] unsubscribe error:", err);
  }
}

// Show notification via SW (works when app is open; push API handles background)
async function showSWNotification(title: string, body: string, icon?: string, tag?: string): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    if (Notification.permission === "granted") {
      await registration.showNotification(title, {
        body,
        icon: icon || "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: tag || "adam-local",
        vibrate: [200, 100, 200],
      } as NotificationOptions);
    }
  } catch (err) {
    console.warn("[notif] showNotification failed:", err);
  }
}

// ── Redesigned Points Celebration Overlay ─────────────────────────────
type CelebrationMode = "earned" | "spent";

type PointsCelebrationProps = {
  pointsEarned: number;
  newTotal: number;
  primaryColor: string;
  textColor: string;
  cardBg: string;
  mode?: CelebrationMode;
  rewardName?: string;
  onClose: () => void;
};

function PointsCelebration({
  pointsEarned, newTotal, primaryColor, textColor, cardBg,
  mode = "earned", rewardName, onClose,
}: PointsCelebrationProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [phase, setPhase] = useState<"enter" | "count" | "done">("enter");
  const [particles, setParticles] = useState<Array<{
    x: number; y: number; delay: number; size: number; color: string; vx: number;
  }>>([]);

  const isEarned = mode === "earned";

  useEffect(() => {
    const colors = isEarned
      ? [primaryColor, "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"]
      : ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#fb923c"];
    const ps = Array.from({ length: 24 }, (_, i) => ({
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 30,
      delay: Math.random() * 0.5,
      size: 4 + Math.random() * 6,
      color: colors[i % colors.length],
      vx: (Math.random() - 0.5) * 80,
    }));
    setParticles(ps);
  }, [isEarned, primaryColor]);

  useEffect(() => {
    const t0 = setTimeout(() => {
      setPhase("count");
      const steps = 40;
      const stepTime = 1200 / steps;
      let current = 0;
      const iv = setInterval(() => {
        current++;
        const eased = Math.round((1 - Math.pow(1 - current / steps, 3)) * pointsEarned);
        setDisplayCount(eased);
        if (current >= steps) {
          clearInterval(iv);
          setDisplayCount(pointsEarned);
          setPhase("done");
        }
      }, stepTime);
      return () => clearInterval(iv);
    }, 300);
    return () => clearTimeout(t0);
  }, [pointsEarned]);

  useEffect(() => {
    const t = setTimeout(onClose, 5500);
    return () => clearTimeout(t);
  }, [onClose]);

  const accentColor = isEarned ? primaryColor : "#7c3aed";
  const emoji = isEarned ? "✦" : "🎁";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        animation: "celebFadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      {/* Confetti particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            backgroundColor: p.color,
            animation: `particleBurst 1.8s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) both`,
            "--vx": `${p.vx}px`,
          } as React.CSSProperties}/>
        ))}
      </div>

      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(320px, 86vw)",
          borderRadius: 28,
          overflow: "hidden",
          animation: "celebCardIn 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          position: "relative",
        }}
      >
        {/* Top band */}
        <div style={{
          backgroundColor: accentColor,
          padding: "32px 28px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }}/>
          <div style={{ position: "absolute", bottom: -30, left: -15, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)" }}/>

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Icon circle */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
              animation: phase === "enter" ? "iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1)" : "none",
            }}>
              {isEarned ? (
                <span style={{ color: "white", fontWeight: 800, fontSize: 22 }}>+</span>
              ) : (
                <span>🎁</span>
              )}
            </div>

            {/* Label */}
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
              margin: "0 0 10px",
            }}>
              {isEarned ? "Points gagnés" : "Récompense utilisée"}
            </p>

            {/* Big number */}
            <div style={{
              display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4,
            }}>
              <span style={{
                fontSize: 68, fontWeight: 800, lineHeight: 1,
                color: "white",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-3px",
                animation: phase === "done" ? "numberPop 0.3s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              }}>
                {isEarned ? "+" : "-"}{displayCount}
              </span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>pts</span>
            </div>

            {rewardName && !isEarned && (
              <div style={{
                display: "inline-block",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20, padding: "5px 14px", marginTop: 10,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{rewardName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div style={{
          backgroundColor: cardBg,
          padding: "20px 24px 24px",
          textAlign: "center",
        }}>
          {/* New balance */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            backgroundColor: `${accentColor}08`,
            borderRadius: 14, padding: "12px 16px",
            marginBottom: 16,
            border: `1px solid ${accentColor}18`,
          }}>
            <span style={{ fontSize: 13, color: `${textColor}60`, fontWeight: 500 }}>Nouveau solde</span>
            <span style={{
              fontSize: 22, fontWeight: 800, color: accentColor,
              fontVariantNumeric: "tabular-nums",
            }}>
              {newTotal} pts
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "14px",
              backgroundColor: accentColor,
              border: "none", borderRadius: 14,
              color: "#fff", fontWeight: 700, fontSize: 15,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {isEarned ? "Super, merci ! 🎉" : "Profitez bien ! 🎁"}
          </button>

          <p style={{ fontSize: 11, color: `${textColor}30`, marginTop: 10, margin: "10px 0 0" }}>
            Se ferme automatiquement…
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────
type BonusAction = {
  id: string;
  label: string;
  urlKey: keyof RestaurantBonusUrls;
  starsKey: keyof RestaurantBonusStars;
  icon: React.ReactNode;
  hint: string;
  actionLabel: string;
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
  { id: "googleMaps", label: "Google Maps", urlKey: "googleMapsUrl", starsKey: "googleMapsBonusStars", icon: <IconGoogleMaps size={20} />, hint: "Laissez un avis 5⭐ sur Google Maps", actionLabel: "Laisser un avis 5 étoiles" },
  { id: "facebook", label: "Facebook", urlKey: "facebookUrl", starsKey: "facebookBonusStars", icon: <IconFacebook size={20} />, hint: "Likez & suivez notre page", actionLabel: "Liker et suivre la page" },
  { id: "instagram", label: "Instagram", urlKey: "instagramUrl", starsKey: "instagramBonusStars", icon: <IconInstagram size={20} />, hint: "Suivez-nous sur Instagram", actionLabel: "Suivre le compte" },
  { id: "twitter", label: "X (Twitter)", urlKey: "twitterUrl", starsKey: "twitterBonusStars", icon: <IconX size={20} />, hint: "Suivez notre compte X", actionLabel: "Suivre le compte X" },
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

function BonusModal({ action, pointsValue, primaryColor, textColor, cardBg, onConfirm, onCancel, loading }: BonusModalProps) {
  const [step, setStep] = useState<"intro" | "waiting" | "confirm">("intro");
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOpenLink = () => {
    setStep("waiting");
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); setStep("confirm"); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ backgroundColor: cardBg, borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: "448px", animation: "slideUp 0.3s ease" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: `${textColor}20`, margin: "0 auto 20px" }}/>
        {step === "intro" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: `${primaryColor}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{action.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>Gagnez des points sur {action.label}</h3>
            <p style={{ fontSize: 13, color: `${textColor}80`, margin: "0 0 6px", lineHeight: 1.5 }}>{action.actionLabel} pour gagner</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: `${primaryColor}15`, borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
              <IconStar size={14} color={primaryColor}/>
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
              onClick={(e) => { e.preventDefault(); window.open((window as any).__bonusUrl, "_blank"); handleOpenLink(); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", backgroundColor: primaryColor, color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: "none", marginBottom: 12 }}
            >
              <IconExternalLink size={16} color="#fff"/>
              Ouvrir {action.label}
            </a>
            <button onClick={onCancel} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", border: "none", color: `${textColor}60`, fontSize: 14, cursor: "pointer" }}>Annuler</button>
          </div>
        )}
        {step === "waiting" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${primaryColor}30`, borderTopColor: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: primaryColor }}>{countdown}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>En cours…</h3>
            <p style={{ fontSize: 13, color: `${textColor}70`, margin: "0 0 20px" }}>Effectuez l'action sur {action.label},<br/>puis revenez ici.</p>
            <button onClick={() => setStep("confirm")} style={{ width: "100%", padding: "13px", backgroundColor: `${primaryColor}15`, border: `1.5px solid ${primaryColor}30`, borderRadius: 14, color: primaryColor, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>J'ai déjà terminé →</button>
          </div>
        )}
        {step === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, margin: "0 0 8px" }}>Avez-vous bien effectué l'action ?</h3>
            <p style={{ fontSize: 13, color: `${textColor}70`, margin: "0 0 24px", lineHeight: 1.5 }}>Confirmez que vous avez <strong>{action.actionLabel.toLowerCase()}</strong> sur {action.label}.</p>
            <button onClick={onConfirm} disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: primaryColor, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginBottom: 10 }}>
              {loading ? "Enregistrement…" : `✅ Oui, j'ai ${action.actionLabel.toLowerCase()} !`}
            </button>
            <button onClick={onCancel} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", border: "none", color: `${textColor}60`, fontSize: 14, cursor: "pointer" }}>Non, annuler</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notification Permission Modal ─────────────────────────────────────
function NotificationPermModal({ primaryColor, textColor, cardBg, onAllow, onDeny }: {
  primaryColor: string; textColor: string; cardBg: string; onAllow: () => void; onDeny: () => void;
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 150, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onDeny}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: cardBg, borderRadius: "24px 24px 0 0", padding: "28px 24px 36px", width: "100%", maxWidth: "448px", animation: "slideUp 0.35s ease" }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: `${textColor}20`, margin: "0 auto 24px" }}/>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", backgroundColor: `${primaryColor}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🔔</div>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: textColor, margin: "0 0 10px" }}>Restez informé !</h3>
          <p style={{ fontSize: 13, color: `${textColor}70`, lineHeight: 1.6, margin: "0 0 28px" }}>
            Activez les notifications pour recevoir vos points, offres spéciales et rappels de récompenses sur votre téléphone.
          </p>
          <button onClick={onAllow} style={{ width: "100%", padding: "14px", backgroundColor: primaryColor, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 10 }}>
            🔔 Activer les notifications
          </button>
          <button onClick={onDeny} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", border: "none", color: `${textColor}55`, fontSize: 14, cursor: "pointer" }}>Plus tard</button>
        </div>
      </div>
    </div>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────
function QRModal({ client, primaryColor, textColor, cardBg, onClose }: {
  client: any; primaryColor: string; textColor: string; cardBg: string; onClose: () => void;
}) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 110, backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: cardBg, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: "448px", animation: "slideUp 0.35s ease", textAlign: "center" }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: `${textColor}20`, margin: "0 auto 20px" }}/>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, margin: "0 0 6px" }}>Mon Code QR</h3>
        <p style={{ fontSize: 13, color: `${textColor}60`, margin: "0 0 24px" }}>Présentez ce code au staff pour scanner vos points</p>
        <div style={{ display: "inline-block", padding: 16, borderRadius: 20, backgroundColor: "#fff", border: `2px solid ${primaryColor}25`, boxShadow: `0 8px 32px ${primaryColor}20` }}>
          <QRCodeSVG value={`${window.location.origin}/scan/${client.customerId}`} size={200} bgColor="#ffffff" fgColor={primaryColor} level="H"/>
        </div>
        <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: `${primaryColor}12`, borderRadius: 20, padding: "8px 20px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: primaryColor }}>{client.name}</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: `${primaryColor}50` }}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: `${textColor}60` }}>#{client.customerId?.slice(-4)}</span>
        </div>
        <button
          onClick={onClose}
          style={{ display: "block", width: "100%", marginTop: 20, padding: "13px", backgroundColor: `${primaryColor}12`, border: `1.5px solid ${primaryColor}30`, borderRadius: 14, color: primaryColor, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ── AnimSection ───────────────────────────────────────────────────────
function AnimSection({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Reward Card ───────────────────────────────────────────────────────
function RewardCard({ reward, clientPts, primaryColor, cardBg, textColor, index }: {
  reward: any; clientPts: number; primaryColor: string; cardBg: string; textColor: string; index: number;
}) {
  const unlocked = clientPts >= reward.pts;
  return (
    <div style={{
      minWidth: "140px", flexShrink: 0,
      borderRadius: 20, overflow: "hidden", position: "relative",
      animation: `popIn 0.4s ease ${index * 0.07}s both`,
      boxShadow: unlocked ? `0 8px 24px ${primaryColor}30` : "0 2px 8px rgba(0,0,0,0.08)",
      border: unlocked ? `1.5px solid ${primaryColor}` : `1.5px solid ${textColor}12`,
    }}>
      <div style={{
        background: unlocked
          ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`
          : `linear-gradient(135deg, #9ca3af, #6b7280)`,
        padding: "14px 12px 18px", position: "relative", minHeight: 90,
      }}>
        <div style={{ position: "absolute", top: 12, left: 12, opacity: 0.9 }}>
          <IconGiftCard size={22}/>
        </div>
        {unlocked && (
          <div style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 8px", display: "flex", alignItems: "center", gap: 3 }}>
            <IconCheck size={9} color="white"/>
            <span style={{ fontSize: 9, fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>DISPO</span>
          </div>
        )}
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.3, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>{reward.name}</p>
        </div>
      </div>
      <div style={{ backgroundColor: cardBg, padding: "10px 12px 12px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <IconStar size={11} color={unlocked ? primaryColor : "#9ca3af"}/>
          <span style={{ fontSize: 13, fontWeight: 800, color: unlocked ? primaryColor : "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{reward.pts} pts</span>
        </div>
        {unlocked ? (
          <div style={{ marginTop: 6, backgroundColor: primaryColor, borderRadius: 8, padding: "4px 0" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "white", letterSpacing: "0.05em" }}>DISPONIBLE</span>
          </div>
        ) : (
          <div style={{ marginTop: 6, backgroundColor: `${textColor}08`, borderRadius: 8, padding: "4px 0" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: `${textColor}40`, letterSpacing: "0.04em" }}>🔒 {reward.pts - clientPts} pts</span>
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
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [activeTab, setActiveTab] = useState("rewards");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [patternStyle, setPatternStyle] = useState<React.CSSProperties>({});
  const [completedBonuses, setCompletedBonuses] = useState<string[]>([]);
  const [claimingBonus, setClaimingBonus] = useState<string | null>(null);
  const [activeBonusModal, setActiveBonusModal] = useState<BonusAction | null>(null);
  const [celebration, setCelebration] = useState<{ pointsEarned: number; newTotal: number; mode?: "earned" | "spent"; rewardName?: string } | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unknown">("unknown");
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifActive, setNotifActive] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  const [swiperOffset, setSwiperOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const CARD_WIDTH = 140;
  const CARD_GAP = 12;

  const restaurantRef = useRef<any>(null);
  useEffect(() => { restaurantRef.current = restaurant; }, [restaurant]);

  // Check if already installed as PWA
  useEffect(() => {
    if (isInStandaloneMode()) setPwaInstalled(true);
    if ("Notification" in window) {
      const perm = Notification.permission;
      setNotifPermission(perm);
      setNotifActive(perm === "granted");
    }
  }, []);

  const fetchClientData = async (id: string) => {
    try {
      const res = await fetch(`/api/client/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClient((prev: any) => {
          if (prev !== null && data.points !== prev.points) {
            const diff = data.points - prev.points;
            const logo = restaurantRef.current?.logo;
            if (diff > 0) {
              setCelebration({ pointsEarned: diff, newTotal: data.points, mode: "earned" });
              showSWNotification("🎉 Points ajoutés !", `+${diff} points sur votre carte. Solde : ${data.points} pts`, logo, "adam-points");
            } else {
              const spent = Math.abs(diff);
              setCelebration({ pointsEarned: spent, newTotal: data.points, mode: "spent", rewardName: data.lastRewardName });
              showSWNotification("🎁 Récompense activée !", `${data.lastRewardName || "Votre récompense"} est prête ! Solde restant : ${data.points} pts`, logo, "adam-reward");
            }
          }
          return data;
        });
        const derived: string[] = [];
        if (data.hasClaimedGoogleMapsBonus) derived.push("googleMaps");
        if (data.hasClaimedFacebookBonus) derived.push("facebook");
        if (data.hasClaimedInstagramBonus) derived.push("instagram");
        if (data.hasClaimedTwitterBonus) derived.push("twitter");
        if (data.completedBonuses && Array.isArray(data.completedBonuses)) {
          data.completedBonuses.forEach((b: string) => { if (!derived.includes(b)) derived.push(b); });
        }
        setCompletedBonuses(derived);
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

  // Register SW
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  // Capture beforeinstallprompt for Android
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    });
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const clientId = localStorage.getItem("clientId");
    const storedRestaurantId = localStorage.getItem("restaurantId");
    if (clientId) await fetchClientData(clientId);
    if (storedRestaurantId) await fetchRestaurantData(storedRestaurantId);
    setTimeout(() => setRefreshing(false), 800);
  };

  // ── Add to Home Screen — smart per-platform ───────────────────────
  const handleAddToHomeScreen = async () => {
    if (pwaInstalled || isInStandaloneMode()) {
      // Already installed — nothing to do
      return;
    }

    const iOS = isIOS();

    if (iOS) {
      // iOS Safari: show native guide
      setShowIOSInstall(true);
      return;
    }

    if (deferredPrompt) {
      // Android/Chrome: trigger native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // Fallback for Android browsers without beforeinstallprompt (e.g. Firefox)
    setShowIOSInstall(true);
  };

  // ── Bell click ─────────────────────────────────────────────────────
  const handleBellClick = async () => {
    if (notifActive) {
      await showSWNotification(
        "🔔 Notifications actives",
        "Vous recevrez vos points et offres spéciales directement ici.",
        restaurantRef.current?.logo
      );
      return;
    }
    if (notifPermission === "denied") {
      alert("Les notifications sont bloquées. Veuillez les activer dans les paramètres de votre navigateur.");
      return;
    }
    setShowNotifModal(true);
  };

  const handleAllowNotif = async () => {
    setShowNotifModal(false);
    const clientId = localStorage.getItem("clientId") || "";
    const subscribed = await subscribeToPush(clientId);
    const perm = Notification.permission as NotificationPermission;
    setNotifPermission(perm);
    setNotifActive(subscribed);
    if (subscribed) {
      setTimeout(async () => {
        await showSWNotification(
          "🎉 Notifications activées !",
          "Vous recevrez +points, offres et récompenses sur ce téléphone.",
          restaurantRef.current?.logo,
          "adam-welcome"
        );
      }, 600);
    }
  };

  const handleOpenBonusModal = (action: BonusAction) => {
    if (completedBonuses.includes(action.id)) return;
    if (!restaurant?.[action.urlKey]) { alert("Ce lien n'est pas encore configuré par le restaurant."); return; }
    (window as any).__bonusUrl = restaurant[action.urlKey];
    setActiveBonusModal(action);
  };

  const handleConfirmBonus = async () => {
    if (!activeBonusModal) return;
    setClaimingBonus(activeBonusModal.id);
    try {
      const res = await fetch("/api/customer/claim-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: activeBonusModal.id, customerId: client.customerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const gained = data.pointsAdded;
        const newTotal = data.newPoints;
        setClient((prev: any) => ({ ...prev, points: newTotal }));
        setCompletedBonuses((prev) => [...prev, activeBonusModal.id]);
        setActiveBonusModal(null);
        setTimeout(() => {
          setCelebration({ pointsEarned: gained, newTotal, mode: "earned" });
          showSWNotification("⭐ Bonus gagné !", `+${gained} points pour ${activeBonusModal.label} ! Solde : ${newTotal} pts`, restaurantRef.current?.logo, "adam-bonus");
        }, 350);
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
    (window as any).__triggerSpentCelebration = (pts: number, newTotal: number, rewardName?: string) => {
      setCelebration({ pointsEarned: pts, newTotal, mode: "spent", rewardName });
      showSWNotification("🎁 Récompense activée !", `${rewardName || "Votre récompense"} est prête ! Solde restant : ${newTotal} pts`, restaurantRef.current?.logo, "adam-reward");
    };
    return () => { delete (window as any).__triggerSpentCelebration; };
  }, []);

  useEffect(() => {
    if (restaurant) {
      try { setPatternStyle(getPatternStyle(restaurant.backgroundPattern || "none")); }
      catch { setPatternStyle({}); }
    }
  }, [restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f9fafb" }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4"/>
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
  const loyaltyRule = restaurant.loyaltyProgram;
  const spendThreshold = loyaltyRule?.spendThreshold ?? 1;
  const pointsEarned = loyaltyRule?.pointsEarned ?? 10;

  const D = { primary: primaryColor, secondary: secondaryColor, background: bgColor, cardBg: cardBgColor, text: textColor };

  let rewards: any[] = [];
  try {
    rewards = restaurant.loyaltyProgram?.rewards
      ?.filter((r: any) => r.isActive)
      ?.map((r: any) => ({ id: r.id, name: r.name, pts: r.pointsRequired, description: r.description || "" }))
      ?.sort((a: any, b: any) => a.pts - b.pts) || [];
  } catch { rewards = []; }

  const coupons = restaurant.coupons || [];
  const clientPts = client.points || 0;
  const nextReward = rewards.find((r) => r.pts > clientPts);
  const progress = nextReward ? Math.min((clientPts / nextReward.pts) * 100, 100) : 100;
  const pointsToNext = nextReward ? nextReward.pts - clientPts : 0;
  const showAlert = nextReward && pointsToNext <= 50;
  const maxOffset = Math.max(0, rewards.length - 2);

  const availableBonuses = BONUS_ACTIONS.filter((action) => restaurant[action.urlKey]);
  const completedCount = availableBonuses.filter((a) => completedBonuses.includes(a.id)).length;
  const totalBonusPoints = availableBonuses.reduce((sum, a) => sum + (restaurant[a.starsKey] || 0), 0);
  const earnedBonusPoints = availableBonuses.filter((a) => completedBonuses.includes(a.id)).reduce((sum, a) => sum + (restaurant[a.starsKey] || 0), 0);

  const getShortId = () => {
    if (client?.customerId?.includes("-")) {
      const parts = client.customerId.split("-");
      return parts[parts.length - 1].slice(-4);
    }
    return client?.id?.slice(-4) ?? "****";
  };

  // Install button label
  const installButtonLabel = pwaInstalled || isInStandaloneMode()
    ? "✓ Application installée"
    : isIOS()
    ? "📲 Ajouter à l'écran d'accueil"
    : deferredPrompt
    ? "📲 Installer l'application"
    : "📲 Ajouter à l'écran d'accueil";

  const installButtonDisabled = pwaInstalled || isInStandaloneMode();

  return (
    <div className="min-h-screen" style={{ backgroundColor: D.background, fontFamily: "'Inter', sans-serif", paddingBottom: 88 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* ── Modals ── */}
      {showIOSInstall && (
        <IOSInstallModal
          primaryColor={D.primary} textColor={D.text} cardBg={D.cardBg}
          onClose={() => setShowIOSInstall(false)}
        />
      )}
      {showNotifModal && (
        <NotificationPermModal
          primaryColor={D.primary} textColor={D.text} cardBg={D.cardBg}
          onAllow={handleAllowNotif}
          onDeny={() => setShowNotifModal(false)}
        />
      )}
      {activeBonusModal && (
        <BonusModal
          action={activeBonusModal}
          pointsValue={restaurant[activeBonusModal.starsKey] || 0}
          primaryColor={D.primary} textColor={D.text} cardBg={D.cardBg}
          onConfirm={handleConfirmBonus}
          onCancel={() => setActiveBonusModal(null)}
          loading={claimingBonus === activeBonusModal.id}
        />
      )}
      {celebration && (
        <PointsCelebration
          pointsEarned={celebration.pointsEarned}
          newTotal={celebration.newTotal}
          primaryColor={D.primary} textColor={D.text} cardBg={D.cardBg}
          mode={celebration.mode}
          rewardName={celebration.rewardName}
          onClose={() => setCelebration(null)}
        />
      )}
      {showQR && client && (
        <QRModal
          client={client}
          primaryColor={D.primary} textColor={D.text} cardBg={D.cardBg}
          onClose={() => setShowQR(false)}
        />
      )}

      <div
        className="max-w-md mx-auto min-h-screen shadow-lg relative border-x"
        style={{ backgroundColor: D.cardBg, ...patternStyle, borderColor: `${D.primary}20`, color: D.text }}
      >
        {/* ── Sticky top bar ── */}
        <div className="sticky top-0 z-20" style={{ backgroundColor: D.cardBg }}>
          {showAlert && (
            <div
              className="mx-3 mt-3 px-4 py-2 rounded-xl flex items-center gap-2"
              style={{ backgroundColor: `${D.primary}15`, border: `1px solid ${D.primary}40`, animation: "slideDown 0.4s ease" }}
            >
              <span className="text-lg">🎯</span>
              <p className="text-xs font-medium" style={{ color: D.primary }}>
                Plus que <strong>{pointsToNext} pts</strong> pour débloquer &ldquo;{nextReward!.name}&rdquo; !
              </p>
            </div>
          )}
          <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: `${D.primary}20` }}>
            <button onClick={handleRefresh} className="p-2 rounded-full transition-colors" style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Actualiser">
              <svg className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke={D.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
            <div className="flex-1 flex justify-center">
              {restaurant.logo ? (
                <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-full border" style={{ borderColor: D.primary }}/>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: D.primary }}>
                  {restaurant.name?.charAt(0) || "R"}
                </div>
              )}
            </div>
            <button
              onClick={handleBellClick}
              className="p-2 rounded-full transition-all active:scale-90"
              style={{ background: notifActive ? `${D.primary}15` : "none", border: "none", cursor: "pointer", borderRadius: 10 }}
              aria-label="Notifications"
            >
              <IconBell size={20} color={D.text} active={notifActive} pulsing={notifActive}/>
            </button>
          </div>
        </div>

        {/* ── Client info ── */}
        <div className="px-4 py-6 text-center border-b" style={{ borderColor: `${D.primary}20`, animation: "fadeSlideIn 0.5s ease" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
            Marhbee byk{" "}
            <span style={{ color: D.primary }}>{client.name}</span>
          </h2>
          <p className="text-xs mt-1.5 font-medium tracking-wider uppercase" style={{ color: `${D.text}60` }}>
            ID {getShortId()}
          </p>
        </div>

        {/* ── Progress bar ── */}
        {nextReward && (
          <AnimSection>
            <div className="px-4 py-3 border-b" style={{ borderColor: `${D.primary}20` }}>
              <div className="rounded-2xl p-4" style={{ backgroundColor: `${D.primary}06`, border: `1px solid ${D.primary}15` }}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <p className="text-sm font-semibold" style={{ color: D.text }}>
                    🎯 Il vous manque&nbsp;
                    <span className="inline-block min-w-[3rem] text-center font-extrabold text-lg" style={{ color: D.primary, fontVariantNumeric: "tabular-nums" }}>
                      {pointsToNext}
                    </span>
                    &nbsp;points
                  </p>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: D.primary, color: "#fff" }}>{nextReward.name}</span>
                </div>
                <p className="text-xs mb-3" style={{ color: `${D.text}70` }}>
                  Pour débloquer <strong style={{ color: D.primary }}>{nextReward.name}</strong> et profiter de votre récompense !
                </p>
                <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${D.primary}20` }}>
                  <div className="h-full rounded-full" style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${D.primary}, ${D.secondary || D.primary})`,
                    boxShadow: `0 0 8px ${D.primary}80`,
                    transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                    animation: "progressGlow 2s ease-in-out infinite alternate",
                  }}/>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px]" style={{ color: `${D.text}50` }}>{clientPts} pts</span>
                  <span className="text-[11px]" style={{ color: `${D.text}50` }}>{nextReward.pts} pts</span>
                </div>
              </div>
            </div>
          </AnimSection>
        )}
        {!nextReward && rewards.length > 0 && (
          <AnimSection>
            <div className="px-4 py-3 border-b" style={{ borderColor: `${D.primary}20` }}>
              <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: `${D.primary}08`, border: `1px solid ${D.primary}20` }}>
                <p className="text-sm font-bold" style={{ color: D.primary }}>🎉 Félicitations ! Vous avez débloqué toutes les récompenses !</p>
                <p className="text-xs mt-1" style={{ color: `${D.text}70` }}>Continuez à gagner des points pour profiter de nouveaux avantages.</p>
              </div>
            </div>
          </AnimSection>
        )}

        {/* ── Balance ── */}
        <AnimSection delay={60}>
          <div className="px-4 py-5 border-b" style={{ borderColor: `${D.primary}20`, backgroundColor: `${D.primary}08` }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: `${D.text}60` }}>Votre solde</p>
            <div className="flex items-center gap-3">
              <div style={{ animation: "coinSpin 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
                <IconPointsCoin size={38} primaryColor={D.primary}/>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold tracking-tight" style={{ color: D.primary, fontVariantNumeric: "tabular-nums", animation: "fadeSlideIn 0.6s ease" }}>
                  {clientPts}
                </p>
                <p className="text-lg font-medium" style={{ color: `${D.primary}90` }}>points</p>
              </div>
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: `${D.text}50` }}>
              {spendThreshold} DT dépensé = {pointsEarned} point{pointsEarned > 1 ? "s" : ""} gagnés
            </p>
          </div>
        </AnimSection>

        {/* ── Rewards Swiper ── */}
        <AnimSection delay={100}>
          <div className="px-4 py-5 border-b" style={{ borderColor: `${D.primary}20` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold tracking-tight" style={{ color: D.text }}>Vos récompenses</h3>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${D.primary}15`, color: D.primary }}>{clientPts} pts</span>
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
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: D.primary, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }}/>
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
                    className="flex pb-2 pt-1"
                    style={{
                      gap: `${CARD_GAP}px`,
                      transform: `translateX(-${swiperOffset * (CARD_WIDTH + CARD_GAP)}px)`,
                      transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
                    }}
                  >
                    {rewards.map((reward, i) => (
                      <RewardCard key={reward.id} reward={reward} clientPts={clientPts} primaryColor={D.primary} cardBg={D.cardBg} textColor={D.text} index={i}/>
                    ))}
                  </div>
                </div>
                {maxOffset > 0 && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button onClick={() => setSwiperOffset(o => Math.max(0, o - 1))} disabled={swiperOffset === 0} className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ border: `1px solid ${D.text}25`, color: D.text, background: "none", cursor: "pointer" }}>‹</button>
                    <div className="flex gap-1.5">
                      {Array.from({ length: maxOffset + 1 }).map((_, i) => (
                        <div key={i} onClick={() => setSwiperOffset(i)} className="h-1.5 rounded-full cursor-pointer transition-all duration-300" style={{ width: i === swiperOffset ? "16px" : "6px", backgroundColor: i === swiperOffset ? D.primary : `${D.text}25` }}/>
                      ))}
                    </div>
                    <button onClick={() => setSwiperOffset(o => Math.min(maxOffset, o + 1))} disabled={swiperOffset >= maxOffset} className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-30" style={{ border: `1px solid ${D.text}25`, color: D.text, background: "none", cursor: "pointer" }}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </AnimSection>

        {/* ── Points à gagner ── */}
        {availableBonuses.length > 0 && (
          <AnimSection delay={140}>
            <div className="px-4 py-5 border-b" style={{ borderColor: `${D.primary}20` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconStar size={16} color={D.primary}/>
                  <h3 className="text-base font-semibold tracking-tight" style={{ color: D.text }}>Points à gagner</h3>
                </div>
                {completedCount > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${D.primary}15`, color: D.primary }}>
                    +{earnedBonusPoints} / {totalBonusPoints} pts
                  </span>
                )}
              </div>
              {availableBonuses.length > 1 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: `${D.text}60` }}>
                    <span>{completedCount} / {availableBonuses.length} actions complétées</span>
                    {completedCount === availableBonuses.length && <span style={{ color: D.primary }}>🎉 Tout complété !</span>}
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${D.primary}20` }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(completedCount / availableBonuses.length) * 100}%`, backgroundColor: D.primary }}/>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {availableBonuses.map((bonus, i) => {
                  const isCompleted = completedBonuses.includes(bonus.id);
                  const pointsValue = restaurant[bonus.starsKey] || 0;
                  return (
                    <div
                      key={bonus.id}
                      className="flex items-center justify-between p-3 rounded-xl border transition-all"
                      style={{
                        borderColor: isCompleted ? `${D.primary}30` : `${D.text}15`,
                        backgroundColor: isCompleted ? `${D.primary}05` : D.cardBg,
                        animation: `popIn 0.4s ease ${i * 0.06}s both`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isCompleted ? `${D.primary}15` : `${D.primary}10` }}>
                          {bonus.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: isCompleted ? `${D.text}80` : D.text }}>{bonus.label}</p>
                          <p className="text-xs" style={{ color: `${D.text}55` }}>{bonus.hint}</p>
                          {!isCompleted && <p className="text-[11px] font-semibold mt-0.5" style={{ color: D.primary }}>+{pointsValue} points</p>}
                          {isCompleted && <p className="text-[11px] font-semibold mt-0.5" style={{ color: `${D.primary}80` }}>+{pointsValue} pts gagnés ✓</p>}
                        </div>
                      </div>
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${D.primary}15` }}>
                          <IconCheck size={14} color={D.primary}/>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenBonusModal(bonus)}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                          style={{ backgroundColor: D.primary, color: "#fff", cursor: "pointer", border: "none" }}
                        >
                          Gagner
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-center mt-3" style={{ color: `${D.text}40` }}>✨ Chaque action n'est récompensée qu'une seule fois.</p>
            </div>
          </AnimSection>
        )}

        {/* ── Coupons tab ── */}
        {coupons.length > 0 && (
          <AnimSection delay={180}>
            <>
              <div className="px-4 py-2 border-b" style={{ borderColor: `${D.primary}20` }}>
                <div className="flex space-x-4">
                  {["rewards", "coupons"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="flex-1 py-2 font-semibold text-sm border-b-2 transition-all"
                      style={{ borderColor: activeTab === tab ? D.primary : "transparent", color: activeTab === tab ? D.primary : `${D.text}60`, background: "none", cursor: "pointer" }}
                    >
                      {tab === "rewards" ? "🎁 Récompenses" : "🏷️ Coupons"}
                    </button>
                  ))}
                </div>
              </div>
              {activeTab === "coupons" && (
                <div className="px-4 py-4 space-y-3" style={{ animation: "fadeSlideIn 0.3s ease" }}>
                  {coupons.map((coupon: any) => (
                    <div key={coupon.id} className="border border-dashed p-3 rounded-2xl flex items-center justify-between" style={{ borderColor: D.primary, backgroundColor: `${D.primary}08` }}>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: D.primary }}>{coupon.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: `${D.text}80` }}>{coupon.description}</p>
                        <p className="text-xs mt-1" style={{ color: `${D.text}60` }}>Valable jusqu'au {coupon.validUntil}</p>
                      </div>
                      <button className="px-3 py-1.5 text-white text-xs font-semibold rounded-xl" style={{ backgroundColor: D.primary, cursor: "pointer", border: "none" }}>Activer</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          </AnimSection>
        )}

        {/* ── About ── */}
        <AnimSection delay={220}>
          <div className="px-4 py-3 border-t" style={{ borderColor: `${D.primary}20` }}>
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="w-full py-3 border rounded-2xl font-medium text-sm flex items-center justify-center space-x-2 transition hover:opacity-80"
              style={{ borderColor: `${D.primary}30`, color: D.text, background: "none", cursor: "pointer" }}
            >
              <span>ℹ️</span><span>À propos de {restaurant.name}</span>
            </button>
            {showAbout && (
              <div className="mt-3 p-4 rounded-2xl space-y-3 border" style={{ backgroundColor: D.background, borderColor: `${D.primary}20`, animation: "fadeSlideIn 0.35s ease" }}>
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
                <button onClick={() => setShowAbout(false)} className="w-full mt-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: `${D.primary}12`, color: D.primary, cursor: "pointer", border: "none" }}>Compris !</button>
              </div>
            )}
          </div>
        </AnimSection>

        {/* ── How to earn ── */}
        <AnimSection delay={260}>
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
                  {idx < arr.length - 1 && <div className="h-px" style={{ backgroundColor: `${D.primary}12` }}/>}
                </div>
              ))}
            </div>
          </div>
        </AnimSection>

        {/* ── Add to home screen ── */}
        <AnimSection delay={300}>
          <div className="px-4 py-5 border-t" style={{ borderColor: `${D.primary}20`, backgroundColor: D.background }}>
            <button
              onClick={handleAddToHomeScreen}
              disabled={installButtonDisabled}
              className="w-full py-4 border-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                borderColor: installButtonDisabled ? `${D.primary}40` : D.primary,
                color: installButtonDisabled ? `${D.primary}70` : D.primary,
                backgroundColor: installButtonDisabled ? `${D.primary}06` : `${D.primary}0d`,
                cursor: installButtonDisabled ? "default" : "pointer",
                opacity: installButtonDisabled ? 0.7 : 1,
              }}
            >
              {installButtonLabel}
            </button>
            <p className="text-xs text-center mt-3" style={{ color: `${D.text}50` }}>Powered by adam · Mentions légales</p>
          </div>
        </AnimSection>
      </div>

      {/* ── Fixed bottom QR button ── */}
      {client && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          display: "flex", justifyContent: "center",
          padding: "12px 16px 20px",
          background: "linear-gradient(to top, rgba(255,255,255,0.98) 60%, rgba(255,255,255,0))",
          pointerEvents: "none",
        }}>
          <button
            onClick={() => setShowQR(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "15px 36px",
              backgroundColor: D.primary, color: "#fff",
              border: "none", borderRadius: 20,
              fontWeight: 700, fontSize: 16,
              letterSpacing: "0.01em", cursor: "pointer",
              pointerEvents: "all",
              boxShadow: `0 8px 28px ${D.primary}55, 0 2px 8px rgba(0,0,0,0.12)`,
              animation: "floatPulse 3s ease-in-out infinite",
              maxWidth: "448px", width: "calc(100% - 48px)",
              justifyContent: "center",
            }}
            aria-label="Afficher mon code QR"
          >
            <IconQR size={22} color="white"/>
            <span>Mon Code QR</span>
          </button>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bellDot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { transform: scale(1.15); box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        @keyframes coinSpin {
          from { transform: rotateY(-90deg) scale(0.6); opacity: 0; }
          to   { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes progressGlow {
          from { box-shadow: 0 0 6px rgba(254,85,2,0.4); }
          to   { box-shadow: 0 0 14px rgba(254,85,2,0.7); }
        }
        @keyframes floatPulse {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-3px); }
        }

        /* ── Celebration ── */
        @keyframes celebFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes celebCardIn {
          from { opacity: 0; transform: scale(0.75) translateY(32px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconPop {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes numberPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes particleBurst {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--vx, 0px), 120px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}