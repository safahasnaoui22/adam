"use client";

import { useState, useEffect } from "react";

const themes = [
  { id: "warm", name: "Chaleureux", colors: { primary: "#f97316", background: "#fff7ed", text: "#431407", accent: "#ea580c" } },
  { id: "fresh", name: "Frais", colors: { primary: "#06b6d4", background: "#ecfeff", text: "#164e63", accent: "#0891b2" } },
  { id: "elegant", name: "Élégant", colors: { primary: "#a855f7", background: "#faf5ff", text: "#4a044e", accent: "#9333ea" } },
  { id: "soft", name: "Rose doux", colors: { primary: "#ec4899", background: "#fdf2f8", text: "#831843", accent: "#db2777" } },
  { id: "sunset", name: "Sunset", colors: { primary: "#f97316", background: "#fff1e6", text: "#2d1b0e", accent: "#c2410c" } },
  { id: "bold", name: "Noir & Audacieux", colors: { primary: "#1e1e1e", background: "#0a0a0a", text: "#ffffff", accent: "#f59e0b" } },
];

// Helper to create an SVG data URI with any emoji
const createPatternSVG = (emoji: string, size: number, fontSize: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" fill="#000000" opacity="0.25">${emoji}</text>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const patterns = [
  { id: "none", name: "Aucun", style: {} },
  { id: "watermelon", name: "Pastèque", style: { backgroundImage: createPatternSVG("🍉", 40, 22), backgroundSize: "40px 40px", backgroundRepeat: "repeat" } },
  { id: "coffee", name: "Café", style: { backgroundImage: createPatternSVG("☕", 45, 26), backgroundSize: "45px 45px", backgroundRepeat: "repeat" } },
  { id: "flowers", name: "Fleurs", style: { backgroundImage: createPatternSVG("🌸", 70, 22), backgroundSize: "70px 70px", backgroundRepeat: "repeat" } },
  { id: "games", name: "Jeux", style: { backgroundImage: createPatternSVG("🎮", 50, 28), backgroundSize: "50px 50px", backgroundRepeat: "repeat" } },
  { id: "pizza", name: "Pizza", style: { backgroundImage: createPatternSVG("🍕", 55, 32), backgroundSize: "55px 55px", backgroundRepeat: "repeat" } },
];

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
    primary: "#fe5502",
    secondary: "#e0682e",
    background: "#ffffff",
    text: "#282424",
    accent: "#fe5502",
  };

  const safeTheme = selectedTheme && typeof selectedTheme === "object" ? selectedTheme : {};
  const colors = safeTheme.colors && typeof safeTheme.colors === "object" ? safeTheme.colors : defaultColors;

  const currentPattern = patterns.find((p) => p.id === selectedPattern) || patterns[0];

  const backgroundStyle = {
    backgroundColor: colors.background,
    backgroundImage: currentPattern.style.backgroundImage,
    backgroundSize: "40px 40px",
    backgroundRepeat: "repeat",
    // No blend mode – pattern sits directly on background
  };

  const getPatternPreviewStyle = (p: (typeof patterns)[0]) => {
    if (p.id === "none") {
      return { backgroundColor: "#f3f4f6" };
    }
    return {
      backgroundImage: p.style.backgroundImage,
      backgroundSize: "40px 40px",
      backgroundColor: colors.background,
      backgroundRepeat: "repeat",
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
          <h3 className="text-lg font-semibold mb-4">🎨 Thème de couleur</h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedTheme.id === t.id ? "border-[#fe5502] shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ backgroundColor: t.colors.background }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                </div>
                <span className="text-sm font-medium" style={{ color: t.colors.text }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">🖼️ Motif d’arrière‑plan</h3>
          <div className="grid grid-cols-3 gap-3">
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePatternChange(p.id)}
                className={`p-2 rounded-lg border-2 transition ${
                  selectedPattern === p.id ? "border-[#fe5502]" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="h-12 rounded-md mb-1" style={getPatternPreviewStyle(p)} />
                <span className="text-xs text-gray-600">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="sticky top-8">
        <h3 className="text-lg font-semibold mb-4">📱 Aperçu (carte client)</h3>
        <div className="max-w-sm mx-auto rounded-3xl border-8 border-gray-800 overflow-hidden shadow-2xl">
          <div className="relative" style={backgroundStyle}>
            <div className="p-5 space-y-4 relative z-10">
              <div className="text-center">
                {restaurantLogo ? (
                  <img src={restaurantLogo} alt="Logo" className="w-16 h-16 rounded-full mx-auto object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl" style={{ backgroundColor: colors.primary, color: "white" }}>
                    🏠
                  </div>
                )}
                <h2 className="text-xl font-bold mt-2" style={{ color: colors.text }}>{restaurantName}</h2>
                <p className="text-sm opacity-80" style={{ color: colors.text }}>Programme de fidélité</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-sm" style={{ color: colors.text }}>Bonjour,</p>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>Marie Dupont</p>
                <p className="text-xs" style={{ color: colors.text }}>ID: CUST1234</p>
              </div>

              <div className="text-center">
                <span className="text-2xl font-bold" style={{ color: colors.primary }}>240 ⭐</span>
                <p className="text-xs opacity-80" style={{ color: colors.text }}>≈ 24 DT</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1" style={{ color: colors.text }}>
                  <span>Prochaine récompense</span>
                  <span>240 / 300 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: "80%", backgroundColor: colors.primary }} />
                </div>
                <p className="text-xs mt-1 text-center" style={{ color: colors.text }}>🎁 Café offert</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 300].map((pts) => (
                  <div key={pts} className="p-2 rounded-lg text-center" style={{ backgroundColor: `${colors.primary}20` }}>
                    <span className="text-lg">☕</span>
                    <p className="text-xs font-semibold" style={{ color: colors.primary }}>{pts}⭐</p>
                  </div>
                ))}
              </div>

              <button className="w-full py-2 rounded-lg font-medium text-white" style={{ backgroundColor: colors.primary }}>
                Mon QR code
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3">
          L’aperçu utilise le logo et le nom de votre commerce. Les couleurs s’appliqueront automatiquement aux clients.
        </p>
      </div>
    </div>
  );
}