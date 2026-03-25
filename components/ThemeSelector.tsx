"use client";

import { useState, useEffect } from "react";

const themes = [
  { 
    id: "warm", 
    name: "☀️ Chaleureux et accueillant", 
    description: "Parfait pour les cafés et boulangeries",
    colors: {
      primary: "#f97316",
      secondary: "#fb923c",
      background: "#fff7ed",
      text: "#431407",
      accent: "#ea580c"
    }
  },
  { 
    id: "fresh", 
    name: "💎 Frais et dynamique", 
    description: "Idéal pour les boutiques modernes",
    colors: {
      primary: "#06b6d4",
      secondary: "#22d3ee",
      background: "#ecfeff",
      text: "#164e63",
      accent: "#0891b2"
    }
  },
  { 
    id: "elegant", 
    name: "✨ Violet élégant", 
    description: "Idéal pour la beauté et le bien-être",
    colors: {
      primary: "#a855f7",
      secondary: "#c084fc",
      background: "#faf5ff",
      text: "#4a044e",
      accent: "#9333ea"
    }
  },
  { 
    id: "soft", 
    name: "🌸 Rose doux", 
    description: "Parfait pour les boutiques et salons",
    colors: {
      primary: "#ec4899",
      secondary: "#f9a8d4",
      background: "#fdf2f8",
      text: "#831843",
      accent: "#db2777"
    }
  },
  { 
    id: "sunset", 
    name: "🌅 Sunset Glow", 
    description: "Dégradé moderne et accrocheur",
    colors: {
      primary: "#f97316",
      secondary: "#d946ef",
      background: "#fff1e6",
      text: "#2d1b0e",
      accent: "#c2410c",
      gradient: "linear-gradient(135deg, #f97316, #d946ef)"
    }
  },
  { 
    id: "bold", 
    name: "🖤 Noir & Audacieux", 
    description: "Look élégant et moderne",
    colors: {
      primary: "#1e1e1e",
      secondary: "#2d2d2d",
      background: "#0a0a0a",
      text: "#ffffff",
      accent: "#f59e0b"
    }
  },
];

const patterns = [
  { 
    id: "none", 
    name: "Aucun motif", 
    icon: "◻️", 
    description: "Pas de motif en arrière-plan",
    style: { backgroundImage: "none" }
  },
  { 
    id: "watermelon", 
    name: "Pastèque", 
    icon: "🍉", 
    count: 20,
    // Using actual watermelon emoji as pattern
    style: { 
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ctext x='10' y='25' font-size='24'%3E🍉%3C/text%3E%3C/svg%3E")`,
      backgroundSize: "40px 40px",
      backgroundColor: "#fff1f0"
    }
  },
  { 
    id: "coffee", 
    name: "Café", 
    icon: "☕", 
    count: 14,
    style: { 
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ctext x='15' y='30' font-size='28'%3E☕%3C/text%3E%3C/svg%3E")`,
      backgroundSize: "50px 50px",
      backgroundColor: "#f4e4d4"
    }
  },
{ 
  id: "flowers", 
  name: "Fleurs", 
  icon: "🌸", 
  count: 10,
  style: { 
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ctext x='10' y='25' font-size='20'%3E🌸%3C/text%3E%3Ctext x='40' y='55' font-size='24'%3E🌻%3C/text%3E%3Ctext x='60' y='20' font-size='18'%3E🌺%3C/text%3E%3Ctext x='20' y='70' font-size='22'%3E🌷%3C/text%3E%3C/svg%3E")`,
    backgroundSize: "80px 80px",
    backgroundColor: "#fff0f5"
  }
},
  { 
    id: "games", 
    name: "Jeux", 
    icon: "🎮", 
    count: 18,
    style: { 
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'%3E%3Ctext x='10' y='30' font-size='28'%3E🎮%3C/text%3E%3C/svg%3E")`,
      backgroundSize: "45px 45px",
      backgroundColor: "#f0f7ff"
    }
  },
  { 
    id: "pizza", 
    name: "Pizza", 
    icon: "🍕", 
    count: 12,
    style: { 
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55' viewBox='0 0 55 55'%3E%3Ctext x='15' y='35' font-size='32'%3E🍕%3C/text%3E%3C/svg%3E")`,
      backgroundSize: "55px 55px",
      backgroundColor: "#fff3e0"
    }
  },
];

interface ThemeSelectorProps {
  theme: any;
  pattern: string;
  onThemeChange: (theme: any) => void;
  onPatternChange: (pattern: string) => void;
}

export default function ThemeSelector({
  theme,
  pattern,
  onThemeChange,
  onPatternChange,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(theme || themes[0]);
  const [preview, setPreview] = useState({
    restaurantName: "safa",
    customerName: "Sophie Martin",
    customerId: "CUST042",
    stamps: 3,
    totalStamps: 10,
  });

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  const handleThemeChange = (t: any) => {
    setSelectedTheme(t);
    onThemeChange(t);
  };

  // Get background style based on selected pattern
  const getBackgroundStyle = () => {
    const selectedPattern = patterns.find(p => p.id === pattern) || patterns[0];
    
    // Base style with theme background color
    const baseStyle = {
      backgroundColor: selectedTheme?.colors?.background || "#ffffff",
    };

    // If pattern is "none", just return the base color
    if (pattern === "none" || !pattern) {
      return baseStyle;
    }

    // For other patterns, combine theme color with pattern
    const patternStyle = selectedPattern.style;
    
    return {
      ...baseStyle,
      backgroundImage: patternStyle.backgroundImage,
      backgroundSize: patternStyle.backgroundSize,
      backgroundPosition: "0 0",
      backgroundRepeat: "repeat",
      // Add a subtle overlay of theme color to make pattern blend
      position: "relative" as const,
    };
  };

  // Get pattern preview style for the pattern buttons
 const getPatternPreviewStyle = (p: typeof patterns[0]) => {
  if (p.id === "none") {
    return { backgroundColor: "#f3f4f6" };
  }
  
  return {
    backgroundImage: p.style.backgroundImage,
    backgroundSize: p.style.backgroundSize,
    backgroundColor: p.style.backgroundColor,
    width: "100%",
    height: "60px",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
  };
};
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column - Configuration */}
      <div className="space-y-8">
        {/* Theme Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Profils de couleur</h2>
          <p className="text-sm text-gray-600 mb-6">
            Personnalisez l'apparence de votre carte telle que vos clients la verront.
          </p>

          <div className="space-y-3">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeChange(t)}
                className={`w-full p-4 rounded-lg border-2 text-left transition ${
                  selectedTheme?.id === t.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ 
                  backgroundColor: t.colors.background,
                  color: t.colors.text
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  <div>
                    <h3 className="font-medium">{t.name}</h3>
                    <p className="text-xs opacity-75">{t.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Arrière-plan (motif)</h2>

          <div className="grid grid-cols-2 gap-4">
            {patterns.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPatternChange(p.id)}
                className={`p-4 rounded-lg border-2 text-center transition ${
                  pattern === p.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Pattern Preview */}
                <div 
                  className="w-full h-16 rounded-lg mb-2"
                  style={getPatternPreviewStyle(p)}
                />
                
                <div className="text-2xl mb-1">{p.icon}</div>
                <h3 className="font-medium text-sm">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-gray-500">{p.description}</p>
                )}
                {p.count && (
                  <p className="text-xs text-gray-500 mt-1">{p.count} icons</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              alert("Thème enregistré!");
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Enregistrer
          </button>
        </div>
      </div>

      {/* Right Column - Live Phone Preview */}
      <div className="sticky top-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: selectedTheme?.colors?.text }}>
          Aperçu en direct
        </h2>
        
        {/* Phone Frame */}
        <div className="relative mx-auto max-w-[320px]">
          {/* Phone Frame */}
          <div className="relative rounded-[3rem] bg-gray-800 p-4 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
            
            {/* Screen */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white h-[600px] flex flex-col">
              {/* Status Bar */}
              <div className="px-6 py-2 flex justify-between text-xs" style={{ backgroundColor: selectedTheme?.colors?.primary, color: '#fff' }}>
                <span>9:41</span>
                <span>📶 🔋 100%</span>
              </div>

              {/* Card Content */}
              <div 
                className="flex-1 p-4 overflow-y-auto relative"
                style={getBackgroundStyle()}
              >
                {/* Pattern Overlay - This makes the pattern visible but subtle */}
                {/* Pattern Overlay with Blur Effect */}
{/* Pattern Overlay with Blur */}
{pattern !== "none" && (
  <div 
    className="absolute inset-0 pointer-events-none"
    style={{
      ...getBackgroundStyle(),
      backgroundColor: "transparent",
      opacity: 0.2,
      filter: "blur(2px)",
      transform: "scale(1.05)",
    }}
  />
)}

{/* Optional: Soft color overlay to mute the pattern */}
{pattern !== "none" && (
  <div 
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundColor: selectedTheme?.colors?.background,
      opacity: 0.3,
      mixBlendMode: "overlay",
    }}
  />
)}

                {/* Content (with relative positioning to appear above pattern) */}
                <div className="relative z-10">
                  {/* Restaurant Header */}
                  <div className="text-center mb-6">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full mb-2 flex items-center justify-center text-white text-2xl"
                      style={{ backgroundColor: selectedTheme?.colors?.primary }}
                    >
                      🏠
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: selectedTheme?.colors?.text }}>
                      {preview.restaurantName}
                    </h3>
                    <p className="text-sm opacity-75" style={{ color: selectedTheme?.colors?.text }}>
                      {preview.customerName}
                    </p>
                    <p className="text-xs opacity-50" style={{ color: selectedTheme?.colors?.text }}>
                      ID: {preview.customerId}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <div 
                      className="w-24 h-24 rounded-lg flex items-center justify-center border-2"
                      style={{ 
                        backgroundColor: selectedTheme?.colors?.background,
                        borderColor: selectedTheme?.colors?.primary
                      }}
                    >
                      <span className="text-4xl">📱</span>
                    </div>
                  </div>

                  {/* Reward Badge */}
                  <div 
                    className="text-center py-1 px-3 rounded-full mx-auto w-fit mb-4 text-sm"
                    style={{ backgroundColor: selectedTheme?.colors?.primary + '20', color: selectedTheme?.colors?.primary }}
                  >
                    Free reward
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1" style={{ color: selectedTheme?.colors?.text }}>
                      <span>{preview.stamps}/{preview.totalStamps} tampons</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="rounded-full h-3 transition-all duration-300"
                        style={{ 
                          width: `${(preview.stamps / preview.totalStamps) * 100}%`,
                          backgroundColor: selectedTheme?.colors?.accent || selectedTheme?.colors?.primary 
                        }}
                      ></div>
                    </div>
                    <p className="text-center text-sm mt-2 opacity-75" style={{ color: selectedTheme?.colors?.text }}>
                      Encore {preview.totalStamps - preview.stamps} tampons
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <button 
                      type="button"
                      className="w-full py-3 rounded-lg font-medium transition"
                      style={{ 
                        backgroundColor: selectedTheme?.colors?.primary,
                        color: '#fff'
                      }}
                    >
                      Afficher le code QR
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full py-3 rounded-lg font-medium transition border-2"
                      style={{ 
                        borderColor: selectedTheme?.colors?.primary,
                        color: selectedTheme?.colors?.primary,
                        backgroundColor: 'transparent'
                      }}
                    >
                      Voir les coupons
                    </button>
                  </div>

                  {/* Coupons Placeholder */}
                  <div 
                    className="p-4 rounded-lg mb-6 text-center"
                    style={{ backgroundColor: selectedTheme?.colors?.background }}
                  >
                    <p className="text-sm opacity-75" style={{ color: selectedTheme?.colors?.text }}>
                      Vos coupons apparaîtront ici
                    </p>
                  </div>

                  {/* Security Warning */}
                  <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ backgroundColor: '#fee2e2' }}>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-red-800">Carte non sécurisée</p>
                      <p className="text-xs text-red-600">Vos tampons peuvent être perdus si les données du navigateur sont effacées.</p>
                    </div>
                  </div>

                  {/* Secure Card Button */}
                  <button 
                    type="button"
                    className="w-full py-3 rounded-lg font-medium mb-4 flex items-center justify-center space-x-2"
                    style={{ 
                      backgroundColor: selectedTheme?.colors?.accent || selectedTheme?.colors?.primary,
                      color: '#fff'
                    }}
                  >
                    <span>🔒</span>
                    <span>Sécuriser ma carte</span>
                    <span className="text-xs opacity-90">+1 tampon gratuit</span>
                  </button>

                  {/* Footer Links */}
                  <div className="space-y-2 text-center">
                    <button type="button" className="text-sm block w-full" style={{ color: selectedTheme?.colors?.primary }}>
                      À propos {preview.restaurantName}
                    </button>
                    <button type="button" className="text-sm block w-full" style={{ color: selectedTheme?.colors?.primary }}>
                      Contact
                    </button>
                    <button type="button" className="text-sm block w-full" style={{ color: selectedTheme?.colors?.primary }}>
                      Conditions et utilisation
                    </button>
                    <button type="button" className="text-sm block w-full" style={{ color: selectedTheme?.colors?.primary }}>
                      Plus d'options
                    </button>
                    <button type="button" className="text-sm block w-full" style={{ color: selectedTheme?.colors?.primary }}>
                      Ajouter à l'écran d'accueil
                    </button>
                  </div>

                  {/* Powered By */}
                  <p className="text-center text-xs mt-6 opacity-50" style={{ color: selectedTheme?.colors?.text }}>
                    Powered by adam · Mentions légales
                  </p>

                  {/* Page Indicator */}
                  <div className="flex justify-center mt-4 space-x-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTheme?.colors?.primary }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Home Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-700 rounded-full border-2 border-gray-600"></div>
        </div>
      </div>
    </div>
  );
}