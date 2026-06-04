"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Segment type ──────────────────────────────────────────────────────
type Segment = {
  label: string;
  points: number;
  color: string;
  textColor: string;
};

// ── Default segments (owner can override via props) ───────────────────
const DEFAULT_SEGMENTS: Segment[] = [
  { label: "10 pts",    points: 10,  color: "#F5C4B3", textColor: "#712B13" },
  { label: "50 pts",    points: 50,  color: "#5DCAA5", textColor: "#085041" },
  { label: "Try again", points: 0,   color: "#D3D1C7", textColor: "#444441" },
  { label: "100 pts",   points: 100, color: "#FAC775", textColor: "#633806" },
  { label: "20 pts",    points: 20,  color: "#F5C4B3", textColor: "#712B13" },
  { label: "200 pts",   points: 200, color: "#AFA9EC", textColor: "#3C3489" },
  { label: "Try again", points: 0,   color: "#D3D1C7", textColor: "#444441" },
  { label: "30 pts",    points: 30,  color: "#5DCAA5", textColor: "#085041" },
];

const MAX_DAILY_SPINS = 3;
const STORAGE_KEY_PREFIX = "spinwheel_";

// ── Props ─────────────────────────────────────────────────────────────
type SpinWheelProps = {
  primaryColor?: string;
  textColor?: string;
  cardBg?: string;
  segments?: Segment[];
  clientId: string;
  restaurantId: string;
  onPointsEarned?: (points: number, newTotal: number) => void;
};

export default function SpinWheel({
  primaryColor = "#fe5502",
  textColor = "#1f2937",
  cardBg = "#ffffff",
  segments = DEFAULT_SEGMENTS,
  clientId,
  restaurantId,
  onPointsEarned,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const spinningRef = useRef(false);

  const [spinning, setSpinning] = useState(false);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [totalPts, setTotalPts] = useState(0);
  const [bestWin, setBestWin] = useState(0);
  const [history, setHistory] = useState<{ label: string; pts: number }[]>([]);
  const [result, setResult] = useState<Segment | null>(null);
  const [showResult, setShowResult] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${clientId}_${restaurantId}`;

  // ── Load persisted state ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const today = new Date().toDateString();
      setTotalPts(saved.totalPts || 0);
      setBestWin(saved.bestWin || 0);
      setHistory(saved.history || []);
      if (saved.date === today) {
        setSpinsUsed(saved.spinsUsed || 0);
      } else {
        setSpinsUsed(0);
        saveState({ ...saved, spinsUsed: 0, date: today });
      }
    } catch {}
  }, [clientId, restaurantId]);

  const saveState = useCallback(
    (overrides?: any) => {
      try {
        const today = new Date().toDateString();
        const state = {
          date: today,
          spinsUsed,
          totalPts,
          bestWin,
          history,
          ...overrides,
        };
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
    },
    [storageKey, spinsUsed, totalPts, bestWin, history]
  );

  // ── Draw wheel ────────────────────────────────────────────────────
  const drawWheel = useCallback(
    (rot: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cx = 160, cy = 160, R = 148;
      const SEG = segments.length;
      const ARC = (2 * Math.PI) / SEG;

      ctx.clearRect(0, 0, 320, 320);

      for (let i = 0; i < SEG; i++) {
        const start = rot + i * ARC - Math.PI / 2;
        const end = start + ARC;
        const seg = segments[i];

        // Segment fill
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, start, end);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + ARC / 2);
        ctx.textAlign = "right";
        ctx.font = seg.points >= 100
          ? "600 13px Inter, sans-serif"
          : "400 12px Inter, sans-serif";
        ctx.fillStyle = seg.textColor;
        ctx.fillText(seg.label, R - 12, 5);
        ctx.restore();
      }

      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, 2 * Math.PI);
      ctx.fillStyle = cardBg;
      ctx.fill();
      ctx.strokeStyle = `${textColor}20`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
      ctx.fillStyle = primaryColor;
      ctx.fill();
    },
    [segments, primaryColor, textColor, cardBg]
  );

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [drawWheel]);

  // ── Determine winner based on final angle ─────────────────────────
  const getWinner = (finalAngle: number): Segment => {
    const SEG = segments.length;
    const ARC = (2 * Math.PI) / SEG;
    const norm = ((finalAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const idx = Math.floor(((2 * Math.PI - norm + ARC / 2) % (2 * Math.PI)) / ARC) % SEG;
    return segments[idx];
  };

  // ── Claim points via API ──────────────────────────────────────────
  const claimSpinPoints = async (points: number): Promise<number> => {
    if (points <= 0) return totalPts;
    try {
      const res = await fetch("/api/client/claim-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "spinWheel",
          points,
          restaurantId,
        }),
      });
      const data = await res.json();
      if (res.ok) return data.newPoints ?? totalPts + points;
    } catch (err) {
      console.error("Failed to claim spin points:", err);
    }
    return totalPts + points;
  };

  // ── Spin handler ──────────────────────────────────────────────────
  const handleSpin = () => {
    if (spinningRef.current || spinsUsed >= MAX_DAILY_SPINS) return;
    spinningRef.current = true;
    setSpinning(true);
    setShowResult(false);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const extraAngle = Math.random() * 2 * Math.PI;
    const startAngle = angleRef.current;
    const target = startAngle + extraSpins * 2 * Math.PI + extraAngle;
    const duration = 4000 + Math.random() * 1500;
    const startTime = performance.now();

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const frame = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const current = startAngle + (target - startAngle) * easeOut(t);
      angleRef.current = current;
      drawWheel(current);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        angleRef.current = target % (2 * Math.PI);
        drawWheel(angleRef.current);
        const winner = getWinner(angleRef.current);

        const newSpinsUsed = spinsUsed + 1;
        setSpinsUsed(newSpinsUsed);
        spinningRef.current = false;
        setSpinning(false);
        setResult(winner);

        claimSpinPoints(winner.points).then((newTotal) => {
          const newBest = winner.points > bestWin ? winner.points : bestWin;
          const newHistory = [
            { label: winner.label, pts: winner.points },
            ...history,
          ].slice(0, 8);

          setTotalPts(newTotal);
          setBestWin(newBest);
          setHistory(newHistory);
          setShowResult(true);

          if (winner.points > 0 && onPointsEarned) {
            onPointsEarned(winner.points, newTotal);
          }

          saveState({
            spinsUsed: newSpinsUsed,
            totalPts: newTotal,
            bestWin: newBest,
            history: newHistory,
            date: new Date().toDateString(),
          });
        });
      }
    };

    requestAnimationFrame(frame);
  };

  const spinsLeft = MAX_DAILY_SPINS - spinsUsed;
  const noSpinsLeft = spinsLeft <= 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 16px" }}>

      {/* ── Stats row ── */}
      <div style={{ display: "flex", gap: 10, width: "100%", marginBottom: 20 }}>
        {[
          { label: "Points gagnés", value: totalPts },
          { label: "Tours utilisés", value: `${spinsUsed}/${MAX_DAILY_SPINS}` },
          { label: "Meilleur gain", value: bestWin > 0 ? bestWin : "—" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1, textAlign: "center", backgroundColor: `${primaryColor}08`,
              borderRadius: 12, padding: "10px 8px",
              border: `1px solid ${primaryColor}20`,
            }}
          >
            <p style={{ fontSize: 11, color: `${textColor}70`, marginBottom: 4, fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: primaryColor }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Wheel ── */}
      <div style={{ position: "relative", width: 320, height: 320, marginBottom: 4 }}>
        {/* Pointer */}
        <div style={{
          position: "absolute", top: -16, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "13px solid transparent",
          borderRight: "13px solid transparent",
          borderTop: `30px solid ${primaryColor}`,
          zIndex: 10,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))",
        }} />

        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          style={{ display: "block", borderRadius: "50%" }}
        />

        {/* Center spin button */}
        <button
          onClick={handleSpin}
          disabled={spinning || noSpinsLeft}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 64, height: 64, borderRadius: "50%",
            backgroundColor: spinning || noSpinsLeft ? "#9ca3af" : primaryColor,
            border: `4px solid ${cardBg}`,
            color: "#fff", fontSize: 11, fontWeight: 700,
            cursor: spinning || noSpinsLeft ? "not-allowed" : "pointer",
            transition: "background 0.2s, transform 0.1s",
            zIndex: 10, lineHeight: 1.2, textAlign: "center",
          }}
        >
          {spinning ? "..." : noSpinsLeft ? "STOP" : "SPIN!"}
        </button>
      </div>

      {/* Spins left indicator */}
      <p style={{ fontSize: 13, color: `${textColor}70`, marginTop: 12, marginBottom: 16 }}>
        {noSpinsLeft
          ? "Plus de tours disponibles aujourd'hui"
          : `${spinsLeft} tour${spinsLeft > 1 ? "s" : ""} disponible${spinsLeft > 1 ? "s" : ""} aujourd'hui`}
      </p>

      {/* ── No spins left card ── */}
      {noSpinsLeft && (
        <div style={{
          width: "100%", padding: "20px",
          backgroundColor: `${textColor}06`,
          borderRadius: 14, textAlign: "center",
          border: `1px solid ${textColor}12`,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏰</div>
          <p style={{ fontWeight: 600, color: textColor, fontSize: 14, marginBottom: 4 }}>Revenez demain !</p>
          <p style={{ color: `${textColor}70`, fontSize: 12 }}>
            Vous avez utilisé vos {MAX_DAILY_SPINS} tours du jour.<br />
            Nouveaux tours disponibles demain.
          </p>
        </div>
      )}

      {/* ── Result card ── */}
      {showResult && result && (
        <div
          style={{
            width: "100%", padding: "20px 16px",
            backgroundColor: result.points > 0 ? `${primaryColor}10` : `${textColor}06`,
            borderRadius: 16, textAlign: "center",
            border: `1.5px solid ${result.points > 0 ? primaryColor + "40" : textColor + "15"}`,
            marginBottom: 16,
            animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {result.points >= 200 ? "🏆" : result.points >= 100 ? "🎉" : result.points > 0 ? "✨" : "😅"}
          </div>
          {result.points > 0 ? (
            <>
              <p style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 4 }}>
                Félicitations !
              </p>
              <p style={{ fontSize: 13, color: `${textColor}70`, marginBottom: 10 }}>
                Vous avez gagné
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, color: primaryColor, marginBottom: 2 }}>
                +{result.points}
              </p>
              <p style={{ fontSize: 13, color: `${textColor}70`, marginBottom: 14 }}>
                points ajoutés à votre compte
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 4 }}>
                Pas de chance !
              </p>
              <p style={{ fontSize: 13, color: `${textColor}70`, marginBottom: 14 }}>
                Essayez encore au prochain tour
              </p>
            </>
          )}
          {!noSpinsLeft && (
            <button
              onClick={() => setShowResult(false)}
              style={{
                padding: "10px 24px",
                backgroundColor: primaryColor,
                color: "#fff", border: "none",
                borderRadius: 10, fontWeight: 600,
                fontSize: 13, cursor: "pointer",
              }}
            >
              Rejouer
            </button>
          )}
        </div>
      )}

      {/* ── History ── */}
      {history.length > 0 && (
        <div style={{ width: "100%" }}>
          <p style={{ fontSize: 12, color: `${textColor}60`, marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Historique des tours
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.slice(0, 5).map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 14px",
                  backgroundColor: `${textColor}05`,
                  borderRadius: 10,
                  border: `1px solid ${textColor}10`,
                }}
              >
                <span style={{ fontSize: 13, color: textColor }}>{h.label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: h.pts > 0 ? primaryColor : `${textColor}50`,
                }}>
                  {h.pts > 0 ? `+${h.pts} pts` : "0 pts"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}