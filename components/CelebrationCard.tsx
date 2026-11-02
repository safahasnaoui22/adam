"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Celebration popup card (cream card, party emoji, orange points pill,
 * green reward box, dark button + floating confetti and small bursts).
 * Purely visual — all logic stays in the components that use it.
 */

type CelebrationCardProps = {
  mode: "earned" | "spent";
  /** Customer first name shown next to the title */
  name?: string;
  emoji?: string;
  /** Title WITHOUT the name, e.g. "Félicitations" (a name is appended) */
  title: string;
  subtitle?: string;
  /** Text inside the orange pill, e.g. "+150 pts". Hidden when empty */
  pill?: string;
  pillIcon?: "star" | "bolt" | "none";
  /** Green box (reward unlocked / used / gift won) */
  rewardLabel?: string;
  rewardName?: string;
  rewardNote?: string;
  rewardEmoji?: string;
  /** Small "new balance" line */
  balance?: number;
  buttonText: string;
  onClose: () => void;
  secondary?: { label: string; onClick: () => void };
  /** Confetti + bursts in the background (off for "points spent") */
  confetti?: boolean;
  primaryColor?: string;
};

const COLORS = ["#ff4d6d", "#ffb703", "#3ddc97", "#4cc9f0", "#7b61ff", "#ff7a00", "#f72585", "#2ec4b6"];

type Piece = { left: number; size: number; color: string; delay: number; dur: number; sway: number; rot: number; round: boolean };
type Burst = { id: number; x: number; y: number; dots: { dx: number; dy: number; size: number; color: string; round: boolean }[] };

const makePieces = (n: number): Piece[] =>
  Array.from({ length: n }, () => ({
    left: Math.random() * 100,
    size: 3 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: -Math.random() * 8,
    dur: 5 + Math.random() * 5,
    sway: (Math.random() - 0.5) * 120,
    rot: 180 + Math.random() * 540,
    round: Math.random() > 0.45,
  }));

const makeBurst = (id: number): Burst => {
  const count = 14;
  return {
    id,
    x: 8 + Math.random() * 84,
    y: 8 + Math.random() * 70,
    dots: Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 34 + Math.random() * 40;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 3 + Math.random() * 3.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() > 0.3,
      };
    }),
  };
};

export default function CelebrationCard({
  mode,
  name,
  emoji,
  title,
  subtitle,
  pill,
  pillIcon = "star",
  rewardLabel,
  rewardName,
  rewardNote,
  rewardEmoji = "🎁",
  balance,
  buttonText,
  onClose,
  secondary,
  confetti = true,
  primaryColor = "#fe5502",
}: CelebrationCardProps) {
  const [pieces] = useState<Piece[]>(() => (confetti ? makePieces(70) : []));
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (!confetti) return;
    let id = 0;
    const timeouts: number[] = [];
    const fire = () => {
      const b = makeBurst(++id);
      setBursts((prev) => [...prev, b]);
      timeouts.push(window.setTimeout(() => setBursts((prev) => prev.filter((x) => x.id !== b.id)), 1500));
    };
    fire();
    const iv = window.setInterval(fire, 750);
    return () => {
      window.clearInterval(iv);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [confetti]);

  if (typeof document === "undefined") return null;

  const cleanName = (name || "").trim();
  const emojiChar = emoji ?? (mode === "earned" ? "🎉" : "🎁");

  const node = (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(30,38,56,0.62)",
        backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
        animation: "celeb2Fade 0.25s ease both",
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes celeb2Fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes celeb2CardIn {
          0% { opacity: 0; transform: translateY(36px) scale(0.72); }
          60% { opacity: 1; transform: translateY(-4px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes celeb2Wobble {
          0%, 100% { transform: rotate(-10deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.12); }
        }
        @keyframes celeb2Rise {
          from { opacity: 0; transform: translateY(14px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes celeb2Pill {
          0% { opacity: 0; transform: scale(0.5); }
          65% { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes celeb2Shine {
          0% { transform: translateX(-120%) skewX(-20deg); }
          60%, 100% { transform: translateX(260%) skewX(-20deg); }
        }
        @keyframes celeb2Fall {
          0% { opacity: 0; transform: translate3d(0, -6vh, 0) rotate(0deg); }
          8% { opacity: 1; }
          100% { opacity: 0.9; transform: translate3d(var(--sway), 108vh, 0) rotate(var(--rot)); }
        }
        @keyframes celeb2Dot {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.3); }
        }
        @media (prefers-reduced-motion: reduce) {
          .celeb2-fx { display: none !important; }
        }
      `}</style>

      {/* Confetti layer */}
      {confetti && (
        <div className="celeb2-fx" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {pieces.map((p, i) => (
            <span
              key={i}
              style={{
                position: "absolute", top: 0, left: `${p.left}%`,
                width: p.size, height: p.round ? p.size : p.size * 1.8,
                borderRadius: p.round ? "50%" : 2,
                background: p.color, opacity: 0,
                animation: `celeb2Fall ${p.dur}s linear ${p.delay}s infinite`,
                ["--sway" as string]: `${p.sway}px`,
                ["--rot" as string]: `${p.rot}deg`,
              } as React.CSSProperties}
            />
          ))}
          {bursts.map((b) => (
            <div key={b.id} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%` }}>
              {b.dots.map((d, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute", left: 0, top: 0,
                    width: d.size, height: d.round ? d.size : d.size * 1.7,
                    borderRadius: d.round ? "50%" : 2,
                    background: d.color,
                    animation: "celeb2Dot 1.1s cubic-bezier(0.15,0.7,0.3,1) forwards",
                    ["--dx" as string]: `${d.dx}px`,
                    ["--dy" as string]: `${d.dy}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(310px, 84vw)",
          background: "linear-gradient(180deg, #faf6ec 0%, #f4eee0 100%)",
          borderRadius: 30,
          padding: "26px 20px 20px",
          textAlign: "center",
          boxShadow: "0 30px 70px rgba(0,0,0,0.38), 0 2px 0 rgba(255,255,255,0.7) inset",
          animation: "celeb2CardIn 0.6s cubic-bezier(0.34,1.4,0.64,1) both",
        }}
      >
        <div style={{ fontSize: 46, lineHeight: 1, display: "inline-block", animation: "celeb2Wobble 1.8s ease-in-out infinite", transformOrigin: "50% 80%" }}>
          {emojiChar}
        </div>

        <h2 style={{ margin: "12px 0 0", fontSize: 21, fontWeight: 800, color: "#1f2937", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
          {title}
          {cleanName && <> <span style={{ color: primaryColor }}>{cleanName}</span></>} !
        </h2>
        {subtitle && (
          <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 500, color: "#8b93a1" }}>{subtitle}</p>
        )}

        {pill && (
          <div style={{ marginTop: 14, animation: "celeb2Pill 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
            <span
              style={{
                position: "relative", overflow: "hidden",
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 24px", borderRadius: 999,
                background: `linear-gradient(90deg, ${primaryColor}, #f59e0b)`,
                color: "#fff", fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em",
                boxShadow: `0 10px 22px ${primaryColor}55`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pillIcon === "star" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
                </svg>
              )}
              {pillIcon === "bolt" && <span style={{ fontSize: 18 }}>⚡</span>}
              {pill}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", top: 0, bottom: 0, width: "35%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                  animation: "celeb2Shine 2.6s ease-in-out 0.9s infinite",
                }}
              />
            </span>
          </div>
        )}

        {rewardName && (
          <div
            style={{
              marginTop: 14, padding: "10px 12px 12px", borderRadius: 16,
              background: "rgba(74,222,128,0.16)", border: "1.5px solid rgba(34,197,94,0.38)",
              animation: "celeb2Rise 0.5s ease 0.5s both",
            }}
          >
            <div style={{ fontSize: 20, lineHeight: 1 }}>{rewardEmoji}</div>
            {rewardLabel && (
              <p style={{ margin: "6px 0 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#16a34a" }}>
                {rewardLabel}
              </p>
            )}
            <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 800, color: "#15803d", lineHeight: 1.25 }}>{rewardName}</p>
            {rewardNote && (
              <p style={{ margin: "6px 0 0", fontSize: 11.5, fontWeight: 500, color: "#4b7a5a", lineHeight: 1.35 }}>{rewardNote}</p>
            )}
          </div>
        )}

        {typeof balance === "number" && (
          <p style={{ margin: "12px 0 0", fontSize: 12, fontWeight: 600, color: "#9aa1ad", animation: "celeb2Rise 0.5s ease 0.55s both" }}>
            Nouveau solde · <span style={{ color: "#6b7280", fontWeight: 800 }}>{balance} pts</span>
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            display: "block", width: "100%", marginTop: 16, padding: "14px 0",
            background: "#0f172a", color: "#fff", border: "none", borderRadius: 999,
            fontFamily: "inherit", fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 10px 22px rgba(15,23,42,0.28)",
            animation: "celeb2Rise 0.5s ease 0.6s both",
          }}
        >
          {buttonText}
        </button>

        {secondary && (
          <button
            onClick={secondary.onClick}
            style={{
              display: "block", width: "100%", marginTop: 8, padding: "10px 0",
              background: "transparent", color: "#6b7280", border: "none",
              fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer",
              animation: "celeb2Rise 0.5s ease 0.7s both",
            }}
          >
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
