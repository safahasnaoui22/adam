"use client";

import { useState, useEffect } from "react";

const themes = [
  {
    id: "warm",
    name: "Chaleureux",
    colors: { primary: "#f97316", background: "#fff7ed", text: "#431407", accent: "#ea580c" },
  },
  {
    id: "fresh",
    name: "Frais",
    colors: { primary: "#06b6d4", background: "#ecfeff", text: "#164e63", accent: "#0891b2" },
  },
  {
    id: "elegant",
    name: "Élégant",
    colors: { primary: "#a855f7", background: "#faf5ff", text: "#4a044e", accent: "#9333ea" },
  },
  {
    id: "soft",
    name: "Rose doux",
    colors: { primary: "#ec4899", background: "#fdf2f8", text: "#831843", accent: "#db2777" },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: { primary: "#f97316", background: "#fff1e6", text: "#2d1b0e", accent: "#c2410c" },
  },
  {
    id: "bold",
    name: "Noir & Audacieux",
    colors: { primary: "#1e1e1e", background: "#0a0a0a", text: "#ffffff", accent: "#f59e0b" },
  },
];

const patterns = [
  { id: "none", name: "Aucun", style: {} },

  {
    id: "watermelon",
    name: "Pastèque",
    style: {
      backgroundImage: "url('/patterns/watermelon.jpg')",
      backgroundSize: "40px 40px",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "coffee",
    name: "Café",
    style: {
      backgroundImage: "url('/patterns/coffee.jpg')",
      backgroundSize: "45px 45px",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "flowers",
    name: "Fleurs",
    style: {
      backgroundImage: "url('/patterns/flower.jpg')",
      backgroundSize: "70px 70px",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "games",
    name: "Jeux",
    style: {
      backgroundImage: "url('/patterns/game.jpg')",
      backgroundSize: "50px 50px",
      backgroundRepeat: "repeat",
    },
  },
  {
    id: "pizza",
    name: "Pizza",
    style: {
      backgroundImage: "url('/patterns/pizza.jpg')",
      backgroundSize: "55px 55px",
      backgroundRepeat: "repeat",
    },
  },
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

  // ✅ CLEAN BACKGROUND (NO PATTERN HERE)
  const backgroundStyle = {
    backgroundColor: colors.background,
    transform: "translateZ(0)", // GPU layer fix
  };

  const getPatternPreviewStyle = (p: (typeof patterns)[0]) => {
    if (p.id === "none") {
      return { backgroundColor: "#f3f4f6" };
    }
    return {
      ...p.style,
      width: "100%",
      height: "60px",
      borderRadius: "0.5rem",
      marginBottom: "0.5rem",
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* LEFT SIDE */}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">🎨 Thème de couleur</h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedTheme.id === t.id
                    ? "border-[#fe5502] shadow-md"
                    : "border-gray-200 hover:border-gray-300"
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
          <h3 className="text-lg font-semibold mb-4">🖼️ Motif d’arrière-plan</h3>
          <div className="grid grid-cols-3 gap-3">
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePatternChange(p.id)}
                className={`p-2 rounded-lg border-2 transition ${
                  selectedPattern === p.id
                    ? "border-[#fe5502]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div style={getPatternPreviewStyle(p)} />
                <span className="text-xs text-gray-600">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="sticky top-8">
        <h3 className="text-lg font-semibold mb-4">📱 Aperçu (carte client)</h3>

        <div className="max-w-sm mx-auto rounded-3xl border-8 border-gray-800 overflow-hidden shadow-2xl">

          {/* 🔥 MAIN FIXED CONTAINER */}
          <div
            className="relative overflow-hidden"
            style={backgroundStyle}
          >

            {/* ✅ SINGLE RELIABLE PATTERN LAYER */}
            {selectedPattern !== "none" && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  ...currentPattern.style,

                  // 🔥 MOBILE FIXES (IMPORTANT)
                  opacity: 0.7,
                  transform: "translateZ(0)",
                  WebkitTransform: "translateZ(0)",
                  willChange: "transform, opacity",
                }}
              />
            )}

            {/* CONTENT */}
            <div className="p-5 space-y-4 relative z-10">

              <div className="text-center">
                {restaurantLogo ? (
                  <img
                    src={restaurantLogo}
                    alt="Logo"
                    className="w-16 h-16 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl"
                    style={{ backgroundColor: colors.primary, color: "white" }}
                  >
                    🏠
                  </div>
                )}

                <h2 className="text-xl font-bold mt-2" style={{ color: colors.text }}>
                  {restaurantName}
                </h2>

                <p className="text-sm opacity-80" style={{ color: colors.text }}>
                  Programme de fidélité
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <p style={{ color: colors.text }}>Bonjour,</p>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>
                  Marie Dupont
                </p>
              </div>

              <div className="text-center">
                <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                  240 ⭐
                </span>
              </div>

              <button
                className="w-full py-2 rounded-lg text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Mon QR code
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mt-3">
          L’aperçu s’adapte automatiquement aux couleurs et motifs.
        </p>
      </div>
    </div>
  );
}