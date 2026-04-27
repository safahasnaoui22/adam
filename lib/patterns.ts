// lib/patterns.ts
export type PatternId = "none" | "coffee" | "watermelon" | "flowers" | "dots" | "lines" | "cross";

export interface PatternStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
}

// Helper: creates an SVG with emoji, larger spacing, low opacity
const createEmojiPattern = (emoji: string, size: number, fontSize: number, opacity: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}px" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, sans-serif" fill="black" opacity="${opacity}">${emoji}</text>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export const PATTERNS: Record<PatternId, { name: string; style: PatternStyle }> = {
  none: {
    name: "Aucun",
    style: { backgroundImage: "none", backgroundSize: "auto", backgroundRepeat: "repeat" },
  },
  coffee: {
    name: "☕ Café",
    style: {
      backgroundImage: createEmojiPattern("☕", 80, 48, 0.25),
      backgroundSize: "80px 80px",
      backgroundRepeat: "repeat",
    },
  },
  watermelon: {
    name: "🍉 Pastèque",
    style: {
      backgroundImage: createEmojiPattern("🍉", 80, 48, 0.25),
      backgroundSize: "80px 80px",
      backgroundRepeat: "repeat",
    },
  },
  flowers: {
    name: "🌸 Fleurs",
    style: {
      backgroundImage: createEmojiPattern("🌸", 80, 48, 0.25),
      backgroundSize: "80px 80px",
      backgroundRepeat: "repeat",
    },
  },
  dots: {
    name: "⦿ Points",
    style: {
      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.08) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
  lines: {
    name: "〰️ Lignes",
    style: {
      backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 16px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
  cross: {
    name: "✚ Croix",
    style: {
      backgroundImage:
        "linear-gradient(45deg, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(-45deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
};

export function getPatternStyle(patternId: string): PatternStyle {
  const id = patternId as PatternId;
  return PATTERNS[id]?.style || PATTERNS.none.style;
}