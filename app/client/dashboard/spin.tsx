"use client";

import { useEffect } from "react";
import SpinWheel from "@/components/SpinWheel";

// ── Usage from app/client/dashboard/page.tsx ────────────────────────
//
//   import SpinWheelModal from "./spin";
//   const [showSpin, setShowSpin] = useState(false);
//   ...
//   <button onClick={() => setShowSpin(true)}>🎡 Roue de la chance</button>
//   <SpinWheelModal
//     open={showSpin}
//     onClose={() => setShowSpin(false)}
//     restaurantId={restaurant.id}
//     customerId={client.id}
//     restaurantName={restaurant.name}
//     restaurantSlug={restaurant.urlSlug}
//     primaryColor={D.primary}
//     textColor={D.text}
//     cardBg={D.background}
//     onPointsEarned={(pts, newTotal) => {
//       setClient((c: any) => ({ ...c, points: newTotal }));
//     }}
//   />

type SpinWheelModalProps = {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  customerId: string;
  restaurantName?: string;
  restaurantSlug?: string;
  primaryColor?: string;
  textColor?: string;
  cardBg?: string;
  onPointsEarned?: (points: number, newTotal: number) => void;
};

export default function SpinWheelModal({
  open,
  onClose,
  restaurantId,
  customerId,
  restaurantName,
  restaurantSlug,
  primaryColor = "#fe5502",
  textColor = "#1f2937",
  cardBg = "#ffffff",
  onPointsEarned,
}: SpinWheelModalProps) {
  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Roue de la chance"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(15, 15, 20, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "spinModalFadeIn 0.25s ease both",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "92vh",
          overflowY: "auto",
          background: cardBg,
          borderRadius: "28px 28px 0 0",
          padding: "0 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.25)",
          animation: "spinModalSlideUp 0.35s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: `${textColor}20` }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 2px 18px",
        }}>
          <div>
            <h2 style={{
              fontSize: 20, fontWeight: 800, color: textColor,
              letterSpacing: "-0.01em", margin: 0,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 22 }}>🎡</span> Roue de la Chance
            </h2>
            <p style={{ fontSize: 12.5, color: `${textColor}65`, margin: "4px 0 0", fontWeight: 500 }}>
              Tentez de gagner des points bonus
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "none", background: `${textColor}0a`,
              color: textColor, fontSize: 16, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <SpinWheel
          primaryColor={primaryColor}
          textColor={textColor}
          cardBg={cardBg}
          restaurantId={restaurantId}
          customerId={customerId}
          restaurantName={restaurantName}
          restaurantSlug={restaurantSlug}
          onPointsEarned={onPointsEarned}
        />
      </div>

      <style jsx>{`
        @keyframes spinModalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spinModalSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}