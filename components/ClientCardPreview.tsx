// components/ClientCardPreview.tsx
// Static, non-interactive copy of the real client dashboard (app/client/dashboard/page.tsx),
// used inside the phone mockup of the "Thème" tab. Same layout, same styles, same colour
// fallbacks as the real page, but with sample customer data.
"use client";

import React from "react";

type Reward = { id: string; name: string; pts: number };

export interface ClientCardPreviewProps {
  colors: Record<string, string | undefined>;
  patternStyle?: React.CSSProperties;
  name: string;
  logo?: string | null;
  rewards?: Reward[];
  spendThreshold?: number;
  pointsEarned?: number;
  /** Social bonus actions the owner enabled (URL filled in), with their stars. */
  bonuses?: { id: "googleMaps" | "facebook" | "instagram" | "twitter"; stars: number }[];
}

// ── Icons (copied from the real client dashboard) ─────────────────────
const IconGoogleMaps = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);
const IconFacebook = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2" />
    <path d="M16 8h-2a1 1 0 00-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 014-4h2v3z" fill="white" />
  </svg>
);
const IconInstagram = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad-prev" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#FCAF45" />
        <stop offset="50%" stopColor="#F77737" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-prev)" />
    <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="16.5" cy="7.5" r="0.8" fill="white" />
  </svg>
);
const IconX = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#000" />
    <path d="M18 6L13.5 11.5L18.5 18H15.5L12 13.5L8 18H5.5L10.5 12L5.5 6H8.5L12 10L15.5 6H18Z" fill="white" />
  </svg>
);
const IconCheck = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const IconStar = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconQR = ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="5" y="5" width="3" height="3" fill={color} stroke="none" />
    <rect x="16" y="5" width="3" height="3" fill={color} stroke="none" />
    <rect x="5" y="16" width="3" height="3" fill={color} stroke="none" />
    <path d="M14 14h3v3" />
    <path d="M17 17v4" />
    <path d="M21 14v3h-4" />
  </svg>
);
const IconBell = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const IconGiftCard = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
  </svg>
);
const IconGoldCoin = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldCoinPrev" x1="8" y1="6" x2="56" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFE27A" />
        <stop offset="0.55" stopColor="#F6B21A" />
        <stop offset="1" stopColor="#D98A00" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#goldCoinPrev)" />
    <circle cx="32" cy="32" r="30" stroke="#C97F00" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="23" stroke="#FFF3B8" strokeWidth="2" strokeDasharray="2 3" />
    <text x="32" y="42" textAnchor="middle" fontSize="30" fontWeight="800" fontFamily="'Inter', system-ui, sans-serif" fill="#FFF7D1" stroke="#C97F00" strokeWidth="0.6">$</text>
    <path d="M14 20 Q20 11 30 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
  </svg>
);
const IconGiftBox = ({ size = 28, color = "#f43f5e", dim = false }: { size?: number; color?: string; dim?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: dim ? 0.55 : 1 }}>
    <rect x="4" y="13" width="24" height="15" rx="3" fill={color} />
    <rect x="3" y="9" width="26" height="6" rx="2.5" fill={color} />
    <rect x="14.5" y="9" width="3" height="19" fill="white" opacity="0.85" />
    <path d="M16 9 C16 9 11 8.5 10.5 5.6 C10 3 13.5 2.2 15 4.6 C15.7 5.8 16 9 16 9Z" fill="#FFD166" />
    <path d="M16 9 C16 9 21 8.5 21.5 5.6 C22 3 18.5 2.2 17 4.6 C16.3 5.8 16 9 16 9Z" fill="#FFD166" />
    <rect x="4" y="13" width="24" height="3" rx="1.5" fill="black" opacity="0.08" />
  </svg>
);
const IconTicket = ({ size = 28, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9a2 2 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
    <path d="M13 5v2M13 11v2M13 17v2" />
  </svg>
);
const IconChevronRight = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const BONUS_META = {
  googleMaps: { label: "Google Maps", hint: "Laissez un avis 5⭐ sur Google Maps", icon: <IconGoogleMaps size={20} /> },
  facebook: { label: "Facebook", hint: "Likez & suivez notre page", icon: <IconFacebook size={20} /> },
  instagram: { label: "Instagram", hint: "Suivez-nous sur Instagram", icon: <IconInstagram size={20} /> },
  twitter: { label: "X (Twitter)", hint: "Suivez notre compte X", icon: <IconX size={20} /> },
} as const;

const DEFAULT_REWARDS: Reward[] = [
  { id: "d1", name: "Café offert", pts: 100 },
  { id: "d2", name: "Dessert offert", pts: 250 },
  { id: "d3", name: "Menu offert", pts: 400 },
];

export default function ClientCardPreview({
  colors,
  patternStyle = {},
  name,
  logo,
  rewards: rewardsProp,
  spendThreshold = 1,
  pointsEarned = 10,
  bonuses = [],
}: ClientCardPreviewProps) {
  // Same fallbacks as the real client dashboard
  const D = {
    primary: colors.primary || "#fe5502",
    secondary: colors.secondary || "#e0682e",
    background: colors.background || "#ffffff",
    cardBg: colors.cardBackground || "#ffffff",
    text: colors.text || "#1f2937",
  };

  const rewards: Reward[] =
    rewardsProp && rewardsProp.length > 0
      ? [...rewardsProp].sort((a, b) => a.pts - b.pts)
      : DEFAULT_REWARDS;

  // Sample customer: somewhere between the first and second reward
  const clientPts =
    rewards.length >= 2
      ? rewards[0].pts + Math.floor((rewards[1].pts - rewards[0].pts) / 2)
      : Math.floor(rewards[0].pts * 0.6);
  const clientName = "Marie Dupont";
  const displayName = name || "Votre commerce";

  const nextReward = rewards.find((r) => r.pts > clientPts);
  const progress = nextReward ? Math.min((clientPts / nextReward.pts) * 100, 100) : 100;
  const pointsToNext = nextReward ? nextReward.pts - clientPts : 0;

  const plural = (n: number) => (n > 1 ? "s" : "");

  // Milestones track (same algorithm as the real page)
  const MAX_MARKERS = 5;
  const nextIdx = rewards.findIndex((r) => r.pts > clientPts);
  const reachedCount = nextIdx === -1 ? rewards.length : nextIdx;
  const start = Math.max(0, Math.min(reachedCount - 1, rewards.length - MAX_MARKERS));
  const windowed = rewards.slice(start, start + MAX_MARKERS);
  const m = windowed.length;
  const posOf = (i: number) => (m === 1 ? 90 : 9 + (i / (m - 1)) * 82);
  const stops = [
    { pts: start > 0 ? rewards[start - 1].pts : 0, pos: 0 },
    ...windowed.map((r, i) => ({ pts: r.pts, pos: posOf(i) })),
  ];
  let fill = 100;
  if (nextIdx !== -1) {
    fill = 0;
    for (let k = 1; k < stops.length; k++) {
      if (clientPts < stops[k].pts) {
        const lo = stops[k - 1];
        const hi = stops[k];
        const t = Math.max(0, Math.min(1, (clientPts - lo.pts) / Math.max(1, hi.pts - lo.pts)));
        fill = lo.pos + t * (hi.pos - lo.pos);
        break;
      }
    }
  }

  const bonusList = bonuses.map((b) => ({ ...b, ...BONUS_META[b.id] }));

  return (
    <div style={{ backgroundColor: D.background, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100%" }}>
      <div
        className="relative"
        style={{
          backgroundColor: D.cardBg,
          ...patternStyle,
          borderLeft: `1px solid ${D.primary}20`,
          borderRight: `1px solid ${D.primary}20`,
          color: D.text,
          minHeight: "100%",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        }}
      >
        {/* ── Floating actions (refresh / notifications) ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, height: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 12px 0" }}>
            {[
              <svg key="r" width="20" height="20" fill="none" stroke={D.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>,
              <IconBell key="b" size={20} color={D.text} />,
            ].map((icon, i) => (
              <div
                key={i}
                style={{
                  width: 40, height: 40, borderRadius: 999,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${D.cardBg}d9`,
                  backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                  border: `1px solid ${D.text}10`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* ── Hero: logo, name, QR button ── */}
        <div
          style={{
            padding: "56px 20px 8px",
            textAlign: "center",
            background: `linear-gradient(180deg, ${D.primary}26 0%, ${D.primary}0f 55%, transparent 100%)`,
          }}
        >
          <div
            style={{
              width: 104, height: 104, margin: "0 auto", borderRadius: "50%", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fff", border: "4px solid #fff",
              boxShadow: `0 10px 28px ${D.primary}30, 0 2px 8px rgba(0,0,0,0.08)`,
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 36, backgroundColor: D.primary }}>
                {displayName.charAt(0) || "R"}
              </div>
            )}
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#111827", letterSpacing: "-0.6px", lineHeight: 1.1, margin: "16px 0 0" }}>
            {displayName}
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, fontWeight: 500, color: `${D.text}80` }}>
            Marhbee byk <span style={{ color: D.primary, fontWeight: 700 }}>{clientName}</span>
          </p>

          <div
            style={{
              width: "100%", marginTop: 24, display: "flex", alignItems: "center", gap: 16, textAlign: "left",
              padding: "16px 18px", borderRadius: 28, color: "#fff", boxSizing: "border-box",
              background: `linear-gradient(135deg, ${D.primary} 0%, ${D.secondary || D.primary} 100%)`,
              boxShadow: `0 14px 32px ${D.primary}4d, 0 2px 8px rgba(0,0,0,0.08)`,
            }}
          >
            <span style={{ flexShrink: 0, width: 54, height: 54, borderRadius: 18, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconQR size={30} color="#fff" />
            </span>
            <span style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 21, fontWeight: 800, letterSpacing: "-0.2px" }}>Mon code QR</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 500, opacity: 0.88, marginTop: 1 }}>Carte n° 4821</span>
            </span>
            <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconChevronRight size={20} color="#fff" />
            </span>
          </div>

          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 500, color: `${D.text}b3` }}>
            Merci pour votre fidélité 💛
          </p>
        </div>

        {/* ── Points card with reward milestones ── */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ borderRadius: 28, padding: 20, background: D.cardBg, border: `1.5px solid ${D.text}14`, boxShadow: `0 10px 34px ${D.primary}14` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flexShrink: 0 }}><IconGoldCoin size={68} /></div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: D.primary, letterSpacing: "-1px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {clientPts.toLocaleString("fr-FR")}
                </span>
                <span style={{ fontSize: 22, fontWeight: 500, color: `${D.primary}b0` }}>points</span>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ position: "relative", height: 40 }}>
                {windowed.map((r, i) => {
                  const reached = clientPts >= r.pts;
                  return (
                    <div key={r.id} style={{ position: "absolute", left: `${posOf(i)}%`, bottom: 0, transform: "translateX(-50%)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <IconGiftBox size={reached ? 36 : 32} color={D.primary} dim={!reached} />
                    </div>
                  );
                })}
              </div>
              <div style={{ position: "relative", width: "100%", overflow: "hidden", height: 12, borderRadius: 999, backgroundColor: `${D.text}12` }}>
                <div style={{ width: `${fill}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${D.primary}, ${D.secondary || D.primary})` }} />
              </div>
              <div style={{ position: "relative", height: 22, marginTop: 8 }}>
                {windowed.map((r, i) => (
                  <span key={r.id} style={{ position: "absolute", left: `${posOf(i)}%`, transform: "translateX(-50%)", fontSize: 12, fontWeight: 600, color: clientPts >= r.pts ? D.primary : `${D.text}70`, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {r.pts.toLocaleString("fr-FR")}
                  </span>
                ))}
              </div>
            </div>

            <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.375, fontWeight: 500, color: nextReward ? D.primary : D.text }}>
              {nextReward ? (
                <>Plus que <strong>{pointsToNext} pts</strong> pour débloquer {nextReward.name}</>
              ) : (
                "🎉 Vous avez débloqué toutes les récompenses !"
              )}
            </p>
            <p style={{ marginTop: 4, fontSize: 12, color: `${D.text}60` }}>
              {spendThreshold} DT dépensé = {pointsEarned} point{plural(pointsEarned)} gagné{plural(pointsEarned)}
            </p>

            <div style={{ width: "100%", marginTop: 16, padding: "16px 0", borderRadius: 20, background: `${D.primary}12`, color: D.primary, fontSize: 18, fontWeight: 700, textAlign: "center" }}>
              Voir les récompenses
            </div>
          </div>
        </div>

        {/* ── Coupons card ── */}
        <div style={{ padding: "12px 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 28, padding: 16, background: D.cardBg, border: `1.5px solid ${D.text}14`, boxShadow: `0 6px 22px ${D.primary}0d` }}>
            <span style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 20, background: `${D.text}08`, border: `1px solid ${D.text}0f`, color: `${D.text}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconTicket size={30} color="currentColor" />
            </span>
            <span style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 21, fontWeight: 800, color: D.text, letterSpacing: "-0.2px" }}>Coupons</span>
              <span style={{ display: "block", fontSize: 14, color: `${D.text}80`, marginTop: 2 }}>Vos coupons apparaîtront ici</span>
            </span>
            <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 999, background: `${D.text}0a`, color: `${D.text}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconChevronRight size={20} color="currentColor" />
            </span>
          </div>
        </div>

        {/* ── Rewards ── */}
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${D.primary}20` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.025em", color: D.text, margin: 0 }}>Vos récompenses</h3>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, backgroundColor: `${D.primary}15`, color: D.primary }}>{clientPts} pts</span>
          </div>

          {/* Spin wheel entry point */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: 16, borderRadius: 16, background: `linear-gradient(135deg, ${D.primary}18, ${D.primary}08)`, border: `1px solid ${D.primary}30` }}>
            <span style={{ fontSize: 30, lineHeight: 1 }}>🎡</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: D.text, margin: 0 }}>Roue de la chance</p>
              <p style={{ fontSize: 12, marginTop: 2, color: `${D.text}70`, marginBottom: 0 }}>Tournez la roue pour gagner des points bonus</p>
            </div>
            <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, backgroundColor: D.primary, color: "#fff" }}>Jouer</span>
          </div>

          {nextReward && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: `${D.text}70`, margin: 0 }}>
                  Prochain palier : <span style={{ color: D.text, fontWeight: 600 }}>{nextReward.name}</span>
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: D.primary, margin: 0 }}>{clientPts} / {nextReward.pts}</p>
              </div>
              <div style={{ width: "100%", height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: `${D.primary}20` }}>
                <div style={{ height: "100%", borderRadius: 999, width: `${progress}%`, backgroundColor: D.primary }} />
              </div>
            </div>
          )}

          {/* Reward cards (swiper, first cards visible) */}
          <div style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 12, paddingBottom: 8, paddingTop: 4 }}>
              {rewards.map((reward) => {
                const unlocked = clientPts >= reward.pts;
                return (
                  <div
                    key={reward.id}
                    style={{
                      minWidth: 140, flexShrink: 0, borderRadius: 20, overflow: "hidden", position: "relative",
                      boxShadow: unlocked ? `0 8px 24px ${D.primary}30` : "0 2px 8px rgba(0,0,0,0.08)",
                      border: unlocked ? `1.5px solid ${D.primary}` : `1.5px solid ${D.text}12`,
                    }}
                  >
                    <div style={{ background: unlocked ? `linear-gradient(135deg, ${D.primary}, ${D.primary}cc)` : "linear-gradient(135deg, #9ca3af, #6b7280)", padding: "14px 12px 18px", position: "relative", minHeight: 90 }}>
                      <div style={{ position: "absolute", top: 12, left: 12, opacity: 0.9 }}><IconGiftCard size={22} /></div>
                      {unlocked && (
                        <div style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "2px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                          <IconCheck size={9} color="white" />
                          <span style={{ fontSize: 9, fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>DISPO</span>
                        </div>
                      )}
                      <div style={{ marginTop: 28, textAlign: "center" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.3, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>{reward.name}</p>
                      </div>
                    </div>
                    <div style={{ backgroundColor: D.cardBg, padding: "10px 12px 12px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <IconStar size={11} color={unlocked ? D.primary : "#9ca3af"} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: unlocked ? D.primary : "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{reward.pts} pts</span>
                      </div>
                      {unlocked ? (
                        <div style={{ marginTop: 6, backgroundColor: D.primary, borderRadius: 8, padding: "4px 0" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "white", letterSpacing: "0.05em" }}>DISPONIBLE</span>
                        </div>
                      ) : (
                        <div style={{ marginTop: 6, backgroundColor: `${D.text}08`, borderRadius: 8, padding: "4px 0" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: `${D.text}40`, letterSpacing: "0.04em" }}>🔒 {reward.pts - clientPts} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Points à gagner (only the social actions the owner enabled) ── */}
        {bonusList.length > 0 && (
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${D.primary}20` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <IconStar size={16} color={D.primary} />
              <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.025em", color: D.text, margin: 0 }}>Points à gagner</h3>
            </div>
            {bonusList.length > 1 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, color: `${D.text}60` }}>
                  <span>0 / {bonusList.length} actions complétées</span>
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 999, overflow: "hidden", backgroundColor: `${D.primary}20` }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bonusList.map((bonus) => (
                <div key={bonus.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, border: `1px solid ${D.text}15`, backgroundColor: D.cardBg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${D.primary}10` }}>
                      {bonus.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: D.text, margin: 0 }}>{bonus.label}</p>
                      <p style={{ fontSize: 12, color: `${D.text}55`, margin: 0 }}>{bonus.hint}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, marginTop: 2, marginBottom: 0, color: D.primary }}>+{bonus.stars} points</p>
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: D.primary, color: "#fff" }}>Gagner</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 10, textAlign: "center", marginTop: 12, marginBottom: 0, color: `${D.text}40` }}>✨ Chaque action n&apos;est récompensée qu&apos;une seule fois.</p>
          </div>
        )}

        {/* ── About ── */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${D.primary}20` }}>
          <div style={{ width: "100%", padding: "12px 0", border: `1px solid ${D.primary}30`, borderRadius: 16, fontWeight: 500, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: D.text, boxSizing: "border-box" }}>
            <span>ℹ️</span><span>À propos de {displayName}</span>
          </div>
        </div>

        {/* ── How to earn ── */}
   
<div style={{ padding: "16px 16px 8px", borderTop: `1px solid ${D.primary}20` }}>
  <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, marginTop: 0, textAlign: "center", color: `${D.text}50` }}>
    Kiféch nerba7 ? 🤔
  </p>

  <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${D.primary}18` }}>
    {[
      {
        emoji: "🛍️",
        step: "1. Chri w jma3 points",
        desc: `Pour chaque ${spendThreshold} DT dépensés chez un commerce partenaire, تربح ${pointsEarned} points directement fi compte mte3ek !`,
        shade: `${D.primary}0a`,
      },
      {
        emoji: "📱",
        step: "2. Scanni Codek",
        desc: 'Wa9t el paiement, warri code QR mte3ek lel commerçant bech tjama3 points facilement.',
        shade: `${D.primary}06`,
      },
      {
        emoji: "🎁",
        step: "3. Baddel points b cadeaux",
        desc: "Ki tjama3 points kfeya, baddelhom b réductions, cadeaux wala récompenses 3and les commerces partenaires !",
        shade: `${D.primary}0a`,
      },
    ].map((item, idx, arr) => (
      <div key={idx}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 16, backgroundColor: item.shade }}>
          <div style={{ width: 40, height: 40, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, backgroundColor: `${D.primary}20` }}>
            {item.emoji}
          </div>

          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: D.text, margin: 0 }}>
              {item.step}
            </p>
            <p style={{ fontSize: 12, marginTop: 4, marginBottom: 0, lineHeight: 1.625, color: `${D.text}70` }}>
              {item.desc}
            </p>
          </div>
        </div>

        {idx < arr.length - 1 && (
          <div style={{ height: 1, backgroundColor: `${D.primary}12` }} />
        )}
      </div>
    ))}
  </div>
</div>


        {/* ── Add to home screen ── */}
        <div style={{ padding: "20px 16px 96px", borderTop: `1px solid ${D.primary}20`, backgroundColor: D.background }}>
          <div style={{ width: "100%", padding: "16px 0", border: `2px solid ${D.primary}`, borderRadius: 16, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: D.primary, backgroundColor: `${D.primary}0d`, boxSizing: "border-box" }}>
            📲 Ajouter à l&apos;écran d&apos;accueil
          </div>
          <p style={{ fontSize: 12, textAlign: "center", marginTop: 12, marginBottom: 0, color: `${D.text}50` }}>Powered by BONOO · Mentions légales</p>
        </div>
      </div>
    </div>
  );
}
