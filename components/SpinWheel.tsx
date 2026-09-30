"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────
type Segment = {
  label: string;
  points: number;
  color: string;
  textColor: string;
};

type SpinSource = "FREE" | "BONUS";

type SpinStatus = {
  segments: Segment[];
  dailyFreeSpins: number;
  freeSpinsLeft: number;
  bonusSpins: number;
};

type SpinWheelProps = {
  primaryColor?: string;
  textColor?: string;
  cardBg?: string;
  restaurantId: string;
  customerId: string;
  // Used only to build the share message/link — optional, the share
  // button just hides itself if these aren't passed.
  restaurantName?: string;
  restaurantSlug?: string;
  onPointsEarned?: (points: number, newTotal: number) => void;
};

const WHEEL_SIZE = 300;
const R = 138;
const CENTER = WHEEL_SIZE / 2;

export default function SpinWheel({
  primaryColor = "#fe5502",
  textColor = "#1f2937",
  cardBg = "#ffffff",
  restaurantId,
  customerId,
  restaurantName,
  restaurantSlug,
  onPointsEarned,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const spinningRef = useRef(false);

  const [status, setStatus] = useState<SpinStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [totalPts, setTotalPts] = useState(0);
  const [history, setHistory] = useState<{ label: string; pts: number }[]>([]);
  const [result, setResult] = useState<Segment | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; emoji: string; x: number; delay: number }[]>([]);
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  // ── Load wheel config + remaining spins ─────────────────────────
  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/customer/spin?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setStatus(data);
      setTotalPts((prev) => prev); // keep local session tally, don't reset on reload
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Impossible de charger la roue");
    }
  }, [restaurantId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // ── Draw wheel (crisp on retina via devicePixelRatio) ────────────
  const drawWheel = useCallback(
    (rot: number, segments: Segment[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== WHEEL_SIZE * dpr) {
        canvas.width = WHEEL_SIZE * dpr;
        canvas.height = WHEEL_SIZE * dpr;
        ctx.scale(dpr, dpr);
      }

      const SEG = segments.length;
      const ARC = (2 * Math.PI) / SEG;

      ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

      // Soft outer glow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, R + 6, 0, 2 * Math.PI);
      ctx.strokeStyle = `${primaryColor}25`;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < SEG; i++) {
        const start = rot + i * ARC - Math.PI / 2;
        const end = start + ARC;
        const seg = segments[i];

        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.arc(CENTER, CENTER, R, start, end);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // subtle inner highlight for depth
        const grad = ctx.createRadialGradient(CENTER, CENTER, R * 0.2, CENTER, CENTER, R);
        grad.addColorStop(0, "rgba(255,255,255,0.18)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.arc(CENTER, CENTER, R, start, end);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(start + ARC / 2);
        ctx.textAlign = "right";
        ctx.font = seg.points >= 100
          ? "700 14px 'Inter', sans-serif"
          : "600 13px 'Inter', sans-serif";
        ctx.fillStyle = seg.textColor;
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 2;
        ctx.fillText(seg.label, R - 14, 5);
        ctx.restore();
      }

      // Hub
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 34, 0, 2 * Math.PI);
      ctx.fillStyle = cardBg;
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `${textColor}15`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 7, 0, 2 * Math.PI);
      ctx.fillStyle = primaryColor;
      ctx.fill();
    },
    [primaryColor, textColor, cardBg]
  );

  useEffect(() => {
    if (status) drawWheel(angleRef.current, status.segments);
  }, [status, drawWheel]);

  // Inverse of the pointer-at-top winner mapping: rotation whose mod-2π
  // lands the given segment index dead center under the pointer.
  const angleForIndex = (idx: number, segCount: number) => {
    const ARC = (2 * Math.PI) / segCount;
    return ((-idx * ARC) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  };

  const fireConfetti = () => {
    const emojis = ["🎉", "✨", "🎊", "⭐"];
    const burst = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: 10 + Math.random() * 80,
      delay: Math.random() * 0.3,
    }));
    setConfetti(burst);
    window.setTimeout(() => setConfetti([]), 1600);
  };

  // ── Share the result (customer's own win) ───────────────────────────
  const handleShare = async () => {
    if (!result) return;
    const name = restaurantName || "ce commerce";
    const url = restaurantSlug
      ? `${window.location.origin}/${restaurantSlug}`
      : window.location.origin;

    const text =
      result.points > 0
        ? `🎉 Je viens de gagner ${result.points} points sur la roue de la chance de ${name} ! Tente ta chance toi aussi 👇`
        : `J'ai tenté ma chance sur la roue de ${name} 🎡 À ton tour !`;

    const shareData = { title: `Roue de la chance — ${name}`, text, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the native share sheet — not an error, do nothing.
      }
      return;
    }

    // Desktop / unsupported browsers: fall back to copying the message.
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 2000);
    }
  };

  const handleSpin = async () => {
    if (spinningRef.current || !status) return;
    const source: SpinSource | null =
      status.freeSpinsLeft > 0 ? "FREE" : status.bonusSpins > 0 ? "BONUS" : null;
    if (!source) return;

    spinningRef.current = true;
    setSpinning(true);
    setShowResult(false);
    setSpinError(null);

    try {
      const res = await fetch("/api/customer/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, restaurantId, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Le tour a échoué");

      const { winningIndex, prize, newPoints, freeSpinsLeft, bonusSpins } = data;
      const segments = status.segments;
      const ARC = (2 * Math.PI) / segments.length;

      const extraSpins = 6 + Math.floor(Math.random() * 4);
      const targetNorm = angleForIndex(winningIndex, segments.length);
      const startAngle = angleRef.current;
      const startNorm = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const forwardDelta = ((targetNorm - startNorm) + 2 * Math.PI) % (2 * Math.PI);
      const jitter = (Math.random() - 0.5) * (ARC * 0.55);
      const target = startAngle + extraSpins * 2 * Math.PI + forwardDelta + jitter;

      const duration = 4200 + Math.random() * 1200;
      const startTime = performance.now();
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

      const frame = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const current = startAngle + (target - startAngle) * easeOut(t);
        angleRef.current = current;
        drawWheel(current, segments);

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          spinningRef.current = false;
          setSpinning(false);
          setResult(prize);
          setShowResult(true);
          setTotalPts((prev) => prev + prize.points);
          setStatus((prev) => (prev ? { ...prev, freeSpinsLeft, bonusSpins } : prev));
          setHistory((h) => [{ label: prize.label, pts: prize.points }, ...h].slice(0, 6));
          if (prize.points > 0) {
            fireConfetti();
            onPointsEarned?.(prize.points, newPoints);
          }
        }
      };

      requestAnimationFrame(frame);
    } catch (err) {
      spinningRef.current = false;
      setSpinning(false);
      setSpinError(err instanceof Error ? err.message : "Le tour a échoué");
    }
  };

  if (loadError) {
    return (
      <div style={{ textAlign: "center", padding: "32px 16px" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>⚠️</p>
        <p style={{ color: "#DC2626", fontSize: 13, fontWeight: 500 }}>{loadError}</p>
      </div>
    );
  }
  if (!status) {
    return (
      <div style={{ textAlign: "center", padding: "60px 16px" }}>
        <div style={{
          width: 40, height: 40, margin: "0 auto 12px",
          border: `3px solid ${primaryColor}30`,
          borderTopColor: primaryColor,
          borderRadius: "50%",
          animation: "spinLoader 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 13, color: `${textColor}70` }}>Chargement de la roue...</p>
        <style jsx>{`@keyframes spinLoader { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const noSpinsLeft = status.freeSpinsLeft + status.bonusSpins <= 0;
  const nextSource: SpinSource | null =
    status.freeSpinsLeft > 0 ? "FREE" : status.bonusSpins > 0 ? "BONUS" : null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

      {/* ── Stats row ── */}
      <div style={{ display: "flex", gap: 8, width: "100%", marginBottom: 24 }}>
        {[
          { label: "Points gagnés", value: totalPts, icon: "🏆" },
          { label: "Gratuits", value: `${status.freeSpinsLeft}/${status.dailyFreeSpins}`, icon: "🎁" },
          { label: "Bonus", value: status.bonusSpins, icon: "⚡" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1, textAlign: "center",
              background: `linear-gradient(160deg, ${primaryColor}12, ${primaryColor}05)`,
              borderRadius: 16, padding: "12px 6px",
              border: `1px solid ${primaryColor}18`,
            }}
          >
            <p style={{ fontSize: 15, marginBottom: 2 }}>{s.icon}</p>
            <p style={{ fontSize: 19, fontWeight: 800, color: primaryColor, letterSpacing: "-0.02em" }}>{s.value}</p>
            <p style={{ fontSize: 10, color: `${textColor}60`, fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Wheel ── */}
      <div style={{ position: "relative", width: WHEEL_SIZE, height: WHEEL_SIZE, marginBottom: 8 }}>
        {confetti.map((c) => (
          <span
            key={c.id}
            style={{
              position: "absolute", top: "40%", left: `${c.x}%`,
              fontSize: 20, zIndex: 20, pointerEvents: "none",
              animation: `confettiFall 1.3s ease-out ${c.delay}s forwards`,
            }}
          >
            {c.emoji}
          </span>
        ))}

        <div style={{
          position: "absolute", top: -14, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: `26px solid ${primaryColor}`,
          zIndex: 10,
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.2))",
        }} />

        <canvas
          ref={canvasRef}
          style={{
            display: "block", width: WHEEL_SIZE, height: WHEEL_SIZE,
            borderRadius: "50%",
            boxShadow: `0 10px 30px -8px ${primaryColor}50, 0 0 0 6px ${cardBg}, 0 0 0 7px ${textColor}10`,
          }}
        />

        <button
          onClick={handleSpin}
          disabled={spinning || noSpinsLeft}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 60, height: 60, borderRadius: "50%",
            background: spinning || noSpinsLeft
              ? "#9ca3af"
              : `linear-gradient(145deg, ${primaryColor}, ${primaryColor}cc)`,
            border: `4px solid ${cardBg}`,
            color: "#fff", fontSize: 11, fontWeight: 800,
            letterSpacing: "0.03em",
            cursor: spinning || noSpinsLeft ? "not-allowed" : "pointer",
            transition: "transform 0.15s ease, background 0.2s ease",
            boxShadow: spinning || noSpinsLeft ? "none" : `0 4px 14px ${primaryColor}70`,
            zIndex: 10,
          }}
          onMouseDown={(e) => { if (!spinning && !noSpinsLeft) e.currentTarget.style.transform = "translate(-50%, -50%) scale(0.94)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)"; }}
        >
          {spinning ? "···" : noSpinsLeft ? "FIN" : "SPIN"}
        </button>
      </div>

      <p style={{ fontSize: 13, color: `${textColor}75`, marginTop: 10, marginBottom: 6, fontWeight: 500, textAlign: "center" }}>
        {noSpinsLeft
          ? "Plus de tours disponibles"
          : nextSource === "FREE"
          ? `🎁 ${status.freeSpinsLeft} tour${status.freeSpinsLeft > 1 ? "s" : ""} gratuit${status.freeSpinsLeft > 1 ? "s" : ""} aujourd'hui`
          : `⚡ ${status.bonusSpins} tour${status.bonusSpins > 1 ? "s" : ""} bonus disponible${status.bonusSpins > 1 ? "s" : ""}`}
      </p>
      {spinError && (
        <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 8, fontWeight: 500 }}>{spinError}</p>
      )}

      {noSpinsLeft && !showResult && (
        <div style={{
          width: "100%", padding: "22px 16px", marginTop: 14,
          background: `${textColor}06`,
          borderRadius: 18, textAlign: "center",
          border: `1px dashed ${textColor}20`,
        }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>⏰</div>
          <p style={{ fontWeight: 700, color: textColor, fontSize: 14, marginBottom: 4 }}>Revenez demain !</p>
          <p style={{ color: `${textColor}65`, fontSize: 12, lineHeight: 1.5 }}>
            Vos tours gratuits reviennent demain.<br />Faites un achat pour gagner des tours bonus.
          </p>
        </div>
      )}

      {showResult && result && (
        <div
          style={{
            width: "100%", padding: "24px 16px", marginTop: 14,
            background: result.points > 0
              ? `linear-gradient(160deg, ${primaryColor}14, ${primaryColor}05)`
              : `${textColor}06`,
            borderRadius: 20, textAlign: "center",
            border: `1.5px solid ${result.points > 0 ? primaryColor + "45" : textColor + "15"}`,
            animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 8 }}>
            {result.points >= 200 ? "🏆" : result.points >= 100 ? "🎉" : result.points > 0 ? "✨" : "😅"}
          </div>
          {result.points > 0 ? (
            <>
              <p style={{ fontSize: 17, fontWeight: 800, color: textColor, marginBottom: 4 }}>Félicitations !</p>
              <p style={{ fontSize: 13, color: `${textColor}70`, marginBottom: 10 }}>Vous avez gagné</p>
              <p style={{ fontSize: 38, fontWeight: 800, color: primaryColor, letterSpacing: "-0.02em", marginBottom: 2 }}>+{result.points}</p>
              <p style={{ fontSize: 13, color: `${textColor}70`, marginBottom: 16 }}>points ajoutés à votre compte</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 17, fontWeight: 800, color: textColor, marginBottom: 4 }}>Pas de chance !</p>
              <p style={{ fontSize: 13, color: `${textColor}70`, marginBottom: 16 }}>Essayez encore au prochain tour</p>
            </>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleShare}
              style={{
                padding: "11px 22px",
                background: "transparent",
                color: primaryColor, border: `1.5px solid ${primaryColor}50`,
                borderRadius: 12, fontWeight: 700,
                fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 15 }}>📤</span>
              {shareState === "copied" ? "Copié !" : shareState === "error" ? "Échec" : "Partager"}
            </button>
            {!noSpinsLeft && (
              <button
                onClick={() => setShowResult(false)}
                style={{
                  padding: "11px 28px",
                  background: `linear-gradient(145deg, ${primaryColor}, ${primaryColor}cc)`,
                  color: "#fff", border: "none",
                  borderRadius: 12, fontWeight: 700,
                  fontSize: 13, cursor: "pointer",
                  boxShadow: `0 4px 14px ${primaryColor}40`,
                }}
              >
                Rejouer
              </button>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ width: "100%", marginTop: 20 }}>
          <p style={{ fontSize: 11, color: `${textColor}55`, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Historique
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 14px",
                  background: `${textColor}04`,
                  borderRadius: 12,
                  border: `1px solid ${textColor}08`,
                }}
              >
                <span style={{ fontSize: 13, color: textColor, fontWeight: 500 }}>{h.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: h.pts > 0 ? primaryColor : `${textColor}45` }}>
                  {h.pts > 0 ? `+${h.pts} pts` : "0 pts"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(160px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}