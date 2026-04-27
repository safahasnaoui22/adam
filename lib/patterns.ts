// lib/patterns.ts
export type PatternId =
  | "none"
  | "coffee"
  | "watermelon"
  | "flowers"
  | "games"
  | "pizza"
  | "dots"
  | "lines"
  | "cross";

export interface PatternStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
}

// Helper to create SVG data URI with high‑visibility emoji
const createEmojiPattern = (emoji: string, size: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${size * 0.7}px" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Twemoji Mozilla, sans-serif" fill="black" opacity="0.8">${emoji}</text>
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
      backgroundImage: createEmojiPattern("☕", 45),
      backgroundSize: "45px 45px",
      backgroundRepeat: "repeat",
    },
  },
  watermelon: {
    name: "🍉 Pastèque",
    style: {
      backgroundImage: createEmojiPattern("🍉", 45),
      backgroundSize: "45px 45px",
      backgroundRepeat: "repeat",
    },
  },
  flowers: {
    name: "🌸 Fleurs",
    style: {
      backgroundImage: createEmojiPattern("🌸", 50),
      backgroundSize: "50px 50px",
      backgroundRepeat: "repeat",
    },
  },
  games: {
    name: "🎮 Jeux",
    style: {
      backgroundImage: createEmojiPattern("🎮", 50),
      backgroundSize: "50px 50px",
      backgroundRepeat: "repeat",
    },
  },
  pizza: {
    name: "🍕 Pizza",
    style: {
      backgroundImage: createEmojiPattern("🍕", 55),
      backgroundSize: "55px 55px",
      backgroundRepeat: "repeat",
    },
  },
  dots: {
    name: "⦿ Points",
    style: {
      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
  lines: {
    name: "〰️ Lignes",
    style: {
      backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 12px)",
      backgroundSize: "16px 16px",
      backgroundRepeat: "repeat",
    },
  },
  cross: {
    name: "✚ Croix",
    style: {
      backgroundImage:
        "linear-gradient(45deg, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(-45deg, rgba(0,0,0,0.12) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
};

export function getPatternStyle(patternId: string): PatternStyle {
  const id = patternId as PatternId;
  return PATTERNS[id]?.style || PATTERNS.none.style;
}