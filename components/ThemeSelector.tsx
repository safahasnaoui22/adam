// components/ThemeSelector.tsx (full updated)
"use client";

import { useState, useEffect } from "react";
import { PATTERNS, getPatternStyle } from "@/lib/patterns";

const themes = [
  {
    id: "lavande",
    name: "Lavande Douce",
    colors: {
      primary: "rgb(162, 148, 249)",
      background: "rgb(245, 239, 255)",
      text: "rgb(100, 80, 200)",
      accent: "rgb(205, 193, 255)",
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

interface ThemeSelectorProps {
  theme: any;
  pattern: string;
  restaurantName: string;
  restaurantLogo?: string | null;
  onThemeChange: (theme: any) => void;
  onPatternChange: (pattern: string) => void;
}

export default function ThemeSelector({
  theme: initialTheme,
  pattern,
  restaurantName,
  restaurantLogo,
  onThemeChange,
  onPatternChange,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || themes[0]);
  const [selectedPattern, setSelectedPattern] = useState(pattern || "none");

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

  const backgroundStyle = {
    backgroundColor: colors.background,
    ...currentPattern.style,
  };

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
      </div>

      {/* Right: Realistic phone mockup */}
      <div className="sticky top-8">
        <h3 className="text-lg font-semibold mb-4 text-white">📱 Aperçu (carte client)</h3>

        {/* Phone shell */}
        <div className="relative mx-auto" style={{ width: "300px" }}>
          {/* Outer phone body */}
          <div
            className="relative rounded-[3rem] shadow-2xl"
            style={{
              background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
              padding: "12px",
              boxShadow:
                "0 0 0 1px #444, 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Side buttons left */}
            <div
              className="absolute"
              style={{
                left: "-3px",
                top: "80px",
                width: "3px",
                height: "32px",
                background: "#333",
                borderRadius: "2px 0 0 2px",
              }}
            />
            <div
              className="absolute"
              style={{
                left: "-3px",
                top: "124px",
                width: "3px",
                height: "56px",
                background: "#333",
                borderRadius: "2px 0 0 2px",
              }}
            />
            <div
              className="absolute"
              style={{
                left: "-3px",
                top: "192px",
                width: "3px",
                height: "56px",
                background: "#333",
                borderRadius: "2px 0 0 2px",
              }}
            />
            {/* Side button right (power) */}
            <div
              className="absolute"
              style={{
                right: "-3px",
                top: "140px",
                width: "3px",
                height: "72px",
                background: "#333",
                borderRadius: "0 2px 2px 0",
              }}
            />

            {/* Screen bezel */}
            <div
              className="rounded-[2.5rem] overflow-hidden"
              style={{ background: "#000", position: "relative" }}
            >
              {/* Notch / Dynamic Island */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "90px",
                  height: "28px",
                  background: "#000",
                  borderRadius: "20px",
                  zIndex: 20,
                  boxShadow: "0 0 0 1px #222",
                }}
              />

              {/* Screen content */}
              <div
                className="overflow-y-auto"
                style={{
                  ...backgroundStyle,
                  height: "580px",
                  paddingTop: "48px",
                  position: "relative",
                }}
              >
                {/* Status bar */}
                <div
                  className="flex justify-between items-center px-6 pb-1"
                  style={{ fontSize: "11px", color: colors.text, opacity: 0.6 }}
                >
                  <span style={{ fontWeight: 600 }}>9:41</span>
                  <div className="flex gap-1 items-center">
                    <span>●●●●</span>
                    <span>WiFi</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-4 space-y-3">
                  {/* Logo + name */}
                  <div className="text-center pt-1">
                    {restaurantLogo ? (
                      <img
                        src={restaurantLogo}
                        alt="Logo"
                        className="w-16 h-16 rounded-full mx-auto object-cover shadow-md"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl shadow-md"
                        style={{ backgroundColor: colors.primary, color: "white" }}
                      >
                        🏠
                      </div>
                    )}
                    <h2
                      className="text-lg font-bold mt-2"
                      style={{ color: colors.text }}
                    >
                      {restaurantName}
                    </h2>
                    <p className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                      Programme de fidélité
                    </p>
                  </div>

                  {/* Customer info */}
                  <div
                    className="rounded-2xl p-3 text-center"
                    style={{
                      backgroundColor: `${colors.accent}55`,
                      border: `1px solid ${colors.accent}`,
                    }}
                  >
                    <p className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                      Bonjour,
                    </p>
                    <p className="text-base font-semibold" style={{ color: colors.primary }}>
                      Marie Dupont
                    </p>
                    <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                      ID: CUST1234
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                      240 ⭐
                    </span>
                    <p className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                      ≈ 24 DT
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div
                      className="flex justify-between text-xs mb-1"
                      style={{ color: colors.text, opacity: 0.8 }}
                    >
                      <span>Prochaine récompense</span>
                      <span>240 / 300 ⭐</span>
                    </div>
                    <div
                      className="w-full rounded-full h-2"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{ width: "80%", backgroundColor: colors.primary }}
                      />
                    </div>
                    <p
                      className="text-xs mt-1 text-center"
                      style={{ color: colors.text, opacity: 0.7 }}
                    >
                      🎁 Café offert
                    </p>
                  </div>

                  {/* Rewards grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 200, 300].map((pts) => (
                      <div
                        key={pts}
                        className="p-2 rounded-xl text-center"
                        style={{ backgroundColor: `${colors.primary}22`, border: `1px solid ${colors.accent}` }}
                      >
                        <span className="text-lg">☕</span>
                        <p className="text-xs font-semibold" style={{ color: colors.primary }}>
                          {pts}⭐
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className="w-full py-2.5 rounded-2xl font-semibold text-white text-sm shadow-md"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Mon QR code
                  </button>
                </div>
              </div>

              {/* Home indicator */}
              <div
                style={{
                  background: colors.text,
                  opacity: 0.3,
                  width: "100px",
                  height: "4px",
                  borderRadius: "4px",
                  margin: "8px auto",
                }}
              />
            </div>
          </div>

          {/* Reflection shine */}
          <div
            className="absolute inset-0 rounded-[3rem] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
            }}
          />
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          L'aperçu utilise le logo et le nom de votre commerce. Les couleurs s'appliqueront automatiquement aux clients.
        </p>
      </div>
    </div>
  );
}