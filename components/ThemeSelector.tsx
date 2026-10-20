// components/ThemeSelector.tsx (full updated)
"use client";

import { useState, useEffect } from "react";
import { PATTERNS, getPatternStyle } from "@/lib/patterns";
import ClientCardPreview from "@/components/ClientCardPreview";

const themes = [
  {
    id: "lavande",
    name: "Lavande Douce",
    colors: {
      primary: "#A294F9",
      background: "#F5EFFF",
      text: "#6450C8",
      accent: "#CDC1FF",
    },
  },
  {
    id: "rose",
    name: "Rose Bonbon",
    colors: {
      primary: "#FF4081",
      background: "#FFF5F8",
      text: "#D6336C",
      accent: "#FFB6C1",
    },
  },
  {
    id: "ocean",
    name: "Bleu Océan",
    colors: {
      primary: "#3B82F6",
      background: "#EFF6FF",
      text: "#1E3A8A",
      accent: "#93C5FD",
    },
  },
  {
    id: "foret",
    name: "Vert Forêt",
    colors: {
      primary: "#22C55E",
      background: "#F0FDF4",
      text: "#14532D",
      accent: "#86EFAC",
    },
  },
  {
    id: "soleil",
    name: "Orange Soleil",
    colors: {
      primary: "#F97316",
      background: "#FFF7ED",
      text: "#7C2D12",
      accent: "#FDBA74",
    },
  },
  {
    id: "cafe",
    name: "Marron Café",
    colors: {
      primary: "#8B5A2B",
      background: "#FDF8F5",
      text: "#3E2723",
      accent: "#D2B48C",
    },
  },
];

const patternEntries = Object.entries(PATTERNS).map(([id, data]) => ({
  id,
  name: (data as any).name,
  style: (data as any).style,
}));

// Phone preview geometry: the real client dashboard is rendered at a true 390x844
// phone viewport and scaled down to fit the mockup.
const SCREEN_W = 390;
const SCREEN_H = 844;
const PHONE_SCALE = 0.82;
const BEZEL = 11;

interface PreviewReward {
  id: string;
  name: string;
  pts: number;
}

interface ThemeSelectorProps {
  theme: any;
  pattern: string;
  restaurantName: string;
  restaurantLogo?: string | null;
  onThemeChange: (theme: any) => void;
  onPatternChange: (pattern: string) => void;
  /** Real data from the owner's loyalty program (optional, falls back to samples). */
  rewards?: PreviewReward[];
  spendThreshold?: number;
  pointsEarned?: number;
  bonuses?: { id: "googleMaps" | "facebook" | "instagram" | "twitter"; stars: number }[];
}

export default function ThemeSelector({
  theme: initialTheme,
  pattern,
  restaurantName,
  restaurantLogo,
  onThemeChange,
  onPatternChange,
  rewards,
  spendThreshold,
  pointsEarned,
  bonuses,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || themes[0]);
  const [selectedPattern, setSelectedPattern] = useState(pattern || "none");
  const [phoneScrolled, setPhoneScrolled] = useState(false);

  useEffect(() => {
    if (initialTheme) setSelectedTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    setSelectedPattern(pattern);
  }, [pattern]);

  const handleThemeChange = (t: any) => {
    setSelectedTheme(t);
    onThemeChange(t);
  };

  const handlePatternChange = (p: string) => {
    setSelectedPattern(p);
    onPatternChange(p);
  };

  const defaultColors = {
    primary: "rgb(162, 148, 249)",
    background: "rgb(245, 239, 255)",
    text: "rgb(100, 80, 200)",
    accent: "rgb(205, 193, 255)",
  };

  const safeTheme = selectedTheme && typeof selectedTheme === "object" ? selectedTheme : {};
  const colors =
    safeTheme.colors && typeof safeTheme.colors === "object"
      ? safeTheme.colors
      : defaultColors;

  const currentPattern =
    patternEntries.find((p) => p.id === selectedPattern) || patternEntries[0];

  // Same colour keys the real client dashboard reads (theme.colors.*)
  const previewColors: Record<string, string | undefined> = colors;
  const statusColor = colors.text || "#1f2937";

  const getPatternPreviewStyle = (p: (typeof patternEntries)[0]) => {
    if (p.id === "none") {
      return { backgroundColor: "#e5e7eb" };
    }
    return {
      ...p.style,
      backgroundColor: colors.background,
      width: "100%",
      height: "60px",
      borderRadius: "0.5rem",
      marginBottom: "0.5rem",
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Controls */}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">🎨 Thème de couleur</h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeChange(t)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedTheme.id === t.id
                    ? "shadow-md ring-2"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{
                  backgroundColor: t.colors.background,
                  borderColor:
                    selectedTheme.id === t.id ? t.colors.primary : undefined,
                  // @ts-ignore
                  "--tw-ring-color": selectedTheme.id === t.id ? t.colors.primary + "80" : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: t.colors.text }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
{/*
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">🖼️ Motif d'arrière‑plan</h3>
          <div className="grid grid-cols-3 gap-3">
            {patternEntries.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePatternChange(p.id)}
                className={`p-2 rounded-lg border-2 transition ${
                  selectedPattern === p.id
                    ? "bg-white/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{
                  borderColor:
                    selectedPattern === p.id ? colors.primary : undefined,
                }}
              >
                <div
                  className="h-12 rounded-md mb-1 overflow-hidden"
                  style={getPatternPreviewStyle(p)}
                />
                <span className="text-xs text-gray-600">{p.name}</span>
              </button>
            ))}
          </div>
        </div>



        */}
      </div>

      {/* Right: realistic phone showing the real client dashboard */}
      <div className="sticky top-8">
        <h3 className="text-lg font-semibold mb-4 text-white">📱 Aperçu (carte client)</h3>

        <style>{`.bonoo-phone-scroll{scrollbar-width:none;-ms-overflow-style:none}.bonoo-phone-scroll::-webkit-scrollbar{display:none}`}</style>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Phone shell */}
        <div className="relative mx-auto" style={{ width: SCREEN_W * PHONE_SCALE + 2 * BEZEL }}>
          <div
            className="relative"
            style={{
              borderRadius: 56,
              padding: BEZEL,
              background: "linear-gradient(145deg, #3a3a3c 0%, #1c1c1e 45%, #2c2c2e 100%)",
              boxShadow:
                "0 0 0 1.5px #5a5a5e, 0 0 0 3px #111, 0 40px 90px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            {/* Left buttons: action, volume up, volume down */}
            {[
              { top: 96, h: 28 },
              { top: 148, h: 52 },
              { top: 212, h: 52 },
            ].map((b, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: -4, top: b.top, width: 4, height: b.h,
                  background: "linear-gradient(90deg, #555, #2a2a2a)",
                  borderRadius: "3px 0 0 3px",
                }}
              />
            ))}
            {/* Right button: power */}
            <div
              className="absolute"
              style={{
                right: -4, top: 170, width: 4, height: 84,
                background: "linear-gradient(270deg, #555, #2a2a2a)",
                borderRadius: "0 3px 3px 0",
              }}
            />

            {/* Screen */}
            <div
              style={{
                position: "relative",
                width: SCREEN_W * PHONE_SCALE,
                height: SCREEN_H * PHONE_SCALE,
                borderRadius: 46,
                overflow: "hidden",
                background: "#000",
                boxShadow: "inset 0 0 0 1px #000",
              }}
            >
              {/* Dynamic island */}
              <div
                style={{
                  position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                  width: 98, height: 29, borderRadius: 20, background: "#000", zIndex: 30,
                }}
              >
                <div
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    width: 9, height: 9, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #2b3a55, #0b0f18)",
                  }}
                />
              </div>

              {/* Status bar */}
              <div
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 46, zIndex: 25,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 26px 0", pointerEvents: "none", color: statusColor,
                }}
              >
                {/* Backdrop that fades in once the page scrolls under the status bar */}
                <div
                  style={{
                    position: "absolute", inset: 0, zIndex: -1,
                    background: `linear-gradient(to bottom, ${previewColors.cardBackground || "#ffffff"} 60%, ${previewColors.cardBackground || "#ffffff"}00)`,
                    opacity: phoneScrolled ? 1 : 0,
                    transition: "opacity 0.2s ease",
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.2px", fontFamily: "system-ui, -apple-system, sans-serif" }}>9:41</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {/* signal */}
                  <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                    <rect x="0" y="7" width="3" height="4" rx="0.8" />
                    <rect x="4.6" y="5" width="3" height="6" rx="0.8" />
                    <rect x="9.2" y="2.5" width="3" height="8.5" rx="0.8" />
                    <rect x="13.8" y="0" width="3" height="11" rx="0.8" />
                  </svg>
                  {/* wifi */}
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                    <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1-1.1A10.4 10.4 0 0 0 8 .7C5.3.7 2.8 1.7 1 3.5l1 1.1a8.6 8.6 0 0 1 6-2.4Z" />
                    <path d="M8 5.6c1.4 0 2.6.5 3.6 1.4l1-1.1A7 7 0 0 0 8 4.1a7 7 0 0 0-4.6 1.8l1 1.1c1-.9 2.2-1.4 3.6-1.4Z" />
                    <circle cx="8" cy="9" r="1.5" />
                  </svg>
                  {/* battery */}
                  <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
                    <rect x="0.5" y="0.5" width="22" height="11" rx="3.2" stroke="currentColor" opacity="0.45" />
                    <rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor" />
                    <path d="M24 4v4c.8-.3 1.5-1.1 1.5-2S24.8 4.3 24 4Z" fill="currentColor" opacity="0.5" />
                  </svg>
                </div>
              </div>

              {/* Real client dashboard, rendered at 390px wide and scaled to fit */}
              <div
                className="bonoo-phone-scroll"
                style={{
                  width: SCREEN_W,
                  height: SCREEN_H,
                  transform: `scale(${PHONE_SCALE})`,
                  transformOrigin: "top left",
                  overflowY: "auto",
                  overflowX: "hidden",
                  position: "relative",
                  background: previewColors.background || "#ffffff",
                }}
                onScroll={(e) => setPhoneScrolled(e.currentTarget.scrollTop > 8)}
              >
                <ClientCardPreview
                  colors={previewColors}
                  patternStyle={currentPattern.style}
                  name={restaurantName}
                  logo={restaurantLogo}
                  rewards={rewards}
                  spendThreshold={spendThreshold}
                  pointsEarned={pointsEarned}
                  bonuses={bonuses}
                />
              </div>

              {/* Home indicator */}
              <div
                style={{
                  position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
                  width: 118, height: 5, borderRadius: 4, background: "#111", opacity: 0.85, zIndex: 30,
                  pointerEvents: "none", boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
                }}
              />
            </div>
          </div>

          {/* Glass reflection */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 56,
              background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%)",
            }}
          />
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Aperçu fidèle de la carte client (faites défiler dans le téléphone). Le logo, le nom, les récompenses, les couleurs et le motif viennent de votre commerce.
        </p>
      </div>
    </div>
  );
}
