// lib/patterns.ts
export type PatternId = "none" | "dots" | "lines" | "waves" | "cross" | "stripes";

export interface PatternStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
}

export const PATTERNS: Record<PatternId, { name: string; style: PatternStyle }> = {
  none: {
    name: "Aucun",
    style: { backgroundImage: "none", backgroundSize: "auto", backgroundRepeat: "repeat" },
  },
  dots: {
    name: "Points",
    style: {
      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.12) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
  lines: {
    name: "Lignes",
    style: {
      backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 12px)",
      backgroundSize: "16px 16px",
      backgroundRepeat: "repeat",
    },
  },
  waves: {
    name: "Vagues",
    style: {
      backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 14px)",
      backgroundSize: "100% 16px",
      backgroundRepeat: "repeat",
    },
  },
  cross: {
    name: "Croix",
    style: {
      backgroundImage:
        "linear-gradient(45deg, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(-45deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundRepeat: "repeat",
    },
  },
  stripes: {
    name: "Rayures",
    style: {
      backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 12px)",
      backgroundSize: "16px 16px",
      backgroundRepeat: "repeat",
    },
  },
};

export function getPatternStyle(patternId: string): PatternStyle {
  const id = patternId as PatternId;
  return PATTERNS[id]?.style || PATTERNS.none.style;
}