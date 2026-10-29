"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, X, Settings2, Gift, Check, Smartphone, Bell, Phone, Pencil,
  Calendar, ChevronRight, ChevronLeft, ChevronDown, HelpCircle, Repeat, Gauge,
  RotateCcw, BarChart3, Dices, ClipboardList, Ticket, Coins, Zap, Trophy,
  Eye, Link2, Copy,
} from "lucide-react";

type PrizeType = "coupon" | "points" | "gift" | "none" | "free_spin";

type Segment = {
  id: string;
  type: PrizeType;
  description: string;
  label: string;
  points: number;
  probability: number;
  color: string;
  textColor: string;
  stock: number | null; // null = illimité
};

type GameConfig = {
  name: string;
  startDate: string;
  endDate: string;
  rule: "purchase" | "daily" | "custom";
  customRules: string;
  spinsPerDay: string; // free spins per customer per day (used by the "custom" rule)
  firstFree: boolean;
  segments: Segment[];
  conditions: { installApp: boolean; notifications: boolean; phone: boolean };
};

type Stats = {
  totalSpins: number;
  spinsLast7Days: number;
  uniquePlayers: number;
  pointsAwarded: number;
  prizes: { label: string; count: number }[];
};

const PRESET_COLORS = ["#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#8B5CF6", "#14B8A6", "#F97316", "#84CC16"];
const NO_PRIZE = "Pas de prix";

const PRIZE_TYPES: { type: PrizeType; label: string; icon: any }[] = [
  { type: "coupon", label: "Coupon", icon: Ticket },
  { type: "points", label: "Points bonus", icon: Coins },
  { type: "gift", label: "Cadeau", icon: Gift },
  { type: "none", label: "Pas de prix", icon: RotateCcw },
  { type: "free_spin", label: "Tour gratuit", icon: Zap },
];

// label shown on the wheel / cards. Gift & coupon use the name typed by the owner.
const autoLabel = (s: { type: PrizeType; points: number; label: string }) => {
  switch (s.type) {
    case "points": return `${s.points} pts`;
    case "free_spin": return "Tour gratuit";
    case "none": return NO_PRIZE;
    default: return s.label;
  }
};
const inferType = (s: any): PrizeType =>
  s.type ?? (s.points > 0 ? "points" : /^(pas de prix|réessayer)$/i.test(s.label || "") ? "none" : "gift");

const emptyGame = (): GameConfig => ({
  name: "",
  startDate: "",
  endDate: "",
  rule: "purchase",
  customRules: "",
  spinsPerDay: "3",
  firstFree: true,
  segments: [
    { id: "1", type: "none", description: "", label: NO_PRIZE, points: 0, probability: 50, color: PRESET_COLORS[0], textColor: "#ffffff", stock: null },
    { id: "2", type: "none", description: "", label: NO_PRIZE, points: 0, probability: 50, color: PRESET_COLORS[1], textColor: "#ffffff", stock: null },
  ],
  conditions: { installApp: false, notifications: false, phone: true },
});

const toDateInput = (d: string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const isPrize = (s: any) => inferType(s) !== "none";
const fmtPct = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

function Toggle({ on, onClick, size = "md" }: { on: boolean; onClick: () => void; size?: "sm" | "md" }) {
  const w = size === "md" ? "w-11 h-6" : "w-9 h-5";
  const knob = size === "md" ? "w-4 h-4 top-1" : "w-4 h-4 top-0.5";
  const left = size === "md" ? (on ? "left-6" : "left-1") : on ? "left-[18px]" : "left-0.5";
  return (
    <div
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`${w} rounded-full relative cursor-pointer transition-colors shrink-0 ${on ? (size === "md" ? "bg-green-500" : "bg-[#8B5CF6]") : "bg-[#54496b]"}`}
    >
      <div className={`absolute ${knob} ${left} bg-white rounded-full transition-all`} />
    </div>
  );
}

export default function SpinWheelConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig>(emptyGame());
  const [planOpen, setPlanOpen] = useState(false);
  const [editingSegId, setEditingSegId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // UI only: which game is shown in the big central panel + the public link
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  useEffect(() => {
    fetch("/api/restaurant/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.urlSlug) setSlug(d.urlSlug); })
      .catch(() => {});
  }, []);

  const [statsGame, setStatsGame] = useState<any | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { fetchGames(); }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/spin-config");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setGames(data.map((g: any) => ({
          id: g.id,
          name: g.name,
          isActive: g.isActive,
          status: g.isActive ? "Active" : "Brouillon",
          startDate: g.startDate,
          endDate: g.endDate,
          rule: g.rule,
          customRules: g.customRules,
          dailyFreeSpins: g.dailyFreeSpins,
          firstFree: g.firstFree,
          conditions: g.conditions,
          spinCount: g.spinCount ?? 0,
          segments: g.segments || [],
        })));
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- modal open / close ---------- */
  const openNewGame = () => {
    setEditingId(null);
    setGameConfig(emptyGame());
    setPlanOpen(false);
    setEditingSegId(null);
    setShowHelp(false);
    setStep(1);
    setIsModalOpen(true);
  };

  const openEditGame = (game: any) => {
    setEditingId(game.id);
    setGameConfig({
      name: game.name || "",
      startDate: toDateInput(game.startDate),
      endDate: toDateInput(game.endDate),
      rule: game.rule || "purchase",
      customRules: game.customRules || "",
      spinsPerDay: String(game.dailyFreeSpins ?? 3),
      firstFree: game.firstFree ?? true,
      conditions: { installApp: false, notifications: false, phone: true, ...(game.conditions || {}) },
      segments: (game.segments || []).map((s: any, i: number) => ({
        id: Date.now().toString() + i,
        label: s.label,
        points: s.points,
        probability: s.probability ?? parseFloat((100 / game.segments.length).toFixed(1)),
        color: s.color,
        textColor: s.textColor || "#ffffff",
        stock: typeof s.stock === "number" ? s.stock : null,
        type: inferType(s),
        description: s.description || "",
      })),
    });
    setPlanOpen(Boolean(game.startDate || game.endDate));
    setEditingSegId(null);
    setShowHelp(false);
    setStep(1);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setStep(1); setEditingId(null); setEditingSegId(null); };

  /* ---------- card actions ---------- */
  const toggleGame = async (game: any) => {
    const next = !game.isActive;
    // only ONE game can be active: activating this one switches all the others off
    const snapshot = games;
    setGames(prev => prev.map(g => {
      const active = g.id === game.id ? next : next ? false : g.isActive;
      return { ...g, isActive: active, status: active ? "Active" : "Brouillon" };
    }));
    try {
      const res = await fetch("/api/spin-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: game.id, isActive: next }) });
      if (!res.ok) throw new Error();
      toast.success(next ? "Jeu activé — les autres jeux ont été désactivés" : "Jeu désactivé");
    } catch {
      setGames(snapshot);
      toast.error("Impossible de modifier le statut");
    }
  };

  const deleteGame = async (game: any) => {
    if (!window.confirm(`Supprimer le jeu "${game.name}" ?`)) return;
    try {
      const res = await fetch(`/api/spin-config?id=${game.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Jeu supprimé");
      setGames(prev => prev.filter(g => g.id !== game.id));
    } catch {
      toast.error("Échec de la suppression");
    }
  };

  const openStats = async (game: any) => {
    setStatsGame(game);
    setStats(null);
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/spin-config/stats?id=${game.id}`);
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      toast.error("Impossible de charger les statistiques");
      setStatsGame(null);
    } finally {
      setStatsLoading(false);
    }
  };

  /* ---------- wheel preview ---------- */
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameConfig.segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 220, cx = size / 2, cy = size / 2 + 4, R = 100;
    ctx.clearRect(0, 0, size, size + 8);

    // outer dark ring
    ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e1b4b"; ctx.fill();
    ctx.strokeStyle = "#4b3a7a"; ctx.lineWidth = 2; ctx.stroke();

    const total = gameConfig.segments.reduce((a, s) => a + s.probability, 0) || 100;
    let startAngle = -Math.PI / 2;
    gameConfig.segments.forEach((seg) => {
      const arcSize = (seg.probability / total) * (2 * Math.PI);
      const endAngle = startAngle + arcSize;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, startAngle, endAngle); ctx.closePath();
      ctx.fillStyle = seg.color; ctx.fill();

      if (arcSize > 0.25) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = "right"; ctx.font = "700 10px Inter, sans-serif"; ctx.fillStyle = seg.textColor;
        const full = autoLabel(seg) || "…";
        const txt = full.length > 8 ? full.slice(0, 7) + "…" : full;
        ctx.fillText(txt, R - 10, 3); ctx.restore();
      }
      startAngle = endAngle;
    });

    // hub
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#8B5CF6"; ctx.fill();

    // pointer
    ctx.beginPath(); ctx.moveTo(cx - 9, 4); ctx.lineTo(cx + 9, 4); ctx.lineTo(cx, 22); ctx.closePath();
    ctx.fillStyle = "#1e1b4b"; ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
  }, [gameConfig.segments]);

  useEffect(() => {
    if (isModalOpen && step === 2) setTimeout(drawPreview, 50);
  }, [drawPreview, isModalOpen, step, gameConfig.segments]);

  /* ---------- segments ---------- */
  const redistribute = (list: Segment[]) => {
    const newProb = parseFloat((100 / list.length).toFixed(1));
    const out = list.map(s => ({ ...s, probability: newProb }));
    const total = out.reduce((acc, c) => acc + c.probability, 0);
    if (total !== 100) out[out.length - 1].probability = parseFloat((out[out.length - 1].probability + (100 - total)).toFixed(1));
    return out;
  };

  const addSegment = () => {
    if (gameConfig.segments.length >= 12) return toast.error("Maximum 12 segments");
    const list = [...gameConfig.segments, {
      id: Date.now().toString(), type: "none" as PrizeType, description: "", label: NO_PRIZE, points: 0, probability: 0,
      color: PRESET_COLORS[gameConfig.segments.length % PRESET_COLORS.length], textColor: "#ffffff", stock: null,
    }];
    setGameConfig({ ...gameConfig, segments: redistribute(list) });
    setEditingSegId(list[list.length - 1].id);
  };

  const removeSegment = (id: string) => {
    if (gameConfig.segments.length <= 2) return toast.error("La roue doit avoir au moins 2 segments");
    setGameConfig({ ...gameConfig, segments: redistribute(gameConfig.segments.filter(s => s.id !== id)) });
    if (editingSegId === id) setEditingSegId(null);
  };

  const patchSegment = (id: string, patch: Partial<Segment>) =>
    setGameConfig(g => ({
      ...g,
      segments: g.segments.map(s => {
        if (s.id !== id) return s;
        const next = { ...s, ...patch };
        if (patch.type && patch.type !== s.type) {
          // switching prize type resets the fields that belong to the old type
          next.description = "";
          next.points = patch.type === "points" ? (s.points > 0 ? s.points : 10) : 0;
          next.label = patch.type === "gift" || patch.type === "coupon" ? "" : "";
          if (patch.type === "none") next.stock = null;
        }
        if (next.type === "points" || next.type === "free_spin" || next.type === "none") next.label = autoLabel(next);
        return next;
      }),
    }));

  // "Chance de gagner" slider: the other cases are rebalanced automatically so the total stays 100%
  const setChance = (id: string, raw: number) =>
    setGameConfig(g => {
      const v = Math.min(100, Math.max(0, raw));
      const others = g.segments.filter(s => s.id !== id);
      if (others.length === 0) return g;
      const rest = 100 - v;
      const sumOthers = others.reduce((a, s) => a + s.probability, 0);
      const segs = g.segments.map(s => {
        if (s.id === id) return { ...s, probability: parseFloat(v.toFixed(1)) };
        const share = sumOthers > 0 ? s.probability / sumOthers : 1 / others.length;
        return { ...s, probability: parseFloat((rest * share).toFixed(1)) };
      });
      const diff = parseFloat((100 - segs.reduce((a, s) => a + s.probability, 0)).toFixed(1));
      if (diff !== 0) {
        const i = segs.findIndex(s => s.id !== id);
        segs[i] = { ...segs[i], probability: Math.max(0, parseFloat((segs[i].probability + diff).toFixed(1))) };
      }
      return { ...g, segments: segs };
    });

  const totalProb = gameConfig.segments.reduce((a, b) => a + b.probability, 0);
  const totalOk = Math.abs(totalProb - 100) < 0.5;

  /* ---------- wizard navigation ---------- */
  const goNext = () => {
    if (step === 1 && !gameConfig.name.trim()) return toast.error("Le nom du jeu est obligatoire");
    if (step === 1 && gameConfig.startDate && gameConfig.endDate && gameConfig.endDate < gameConfig.startDate) {
      return toast.error("La date de fin doit être après la date de début");
    }
    if (step === 2) {
      const bad = gameConfig.segments.findIndex(s => (s.type === "gift" || s.type === "coupon") && !s.label.trim());
      if (bad >= 0) { setEditingSegId(gameConfig.segments[bad].id); return toast.error(`Case ${bad + 1} : indiquez le nom du ${gameConfig.segments[bad].type === "gift" ? "cadeau" : "coupon"}`); }
      const badPts = gameConfig.segments.findIndex(s => s.type === "points" && s.points <= 0);
      if (badPts >= 0) { setEditingSegId(gameConfig.segments[badPts].id); return toast.error(`Case ${badPts + 1} : indiquez un nombre de points`); }
      if (!totalOk) return toast.error("Le total des probabilités doit être égal à 100%");
    }
    setStep(step + 1);
  };

  const handleSave = async () => {
    if (!gameConfig.name.trim()) { setStep(1); return toast.error("Le nom du jeu est obligatoire"); }
    if (!totalOk) { setStep(2); return toast.error("Le total des probabilités doit être égal à 100%"); }
    const spinsPerDay = parseInt(gameConfig.spinsPerDay, 10);
    if (gameConfig.rule === "custom" && (!Number.isInteger(spinsPerDay) || spinsPerDay < 1 || spinsPerDay > 20)) {
      setStep(1);
      return toast.error("Le nombre de tours par jour doit être entre 1 et 20");
    }
    setSaving(true);
    try {
      const payload: any = {
        name: gameConfig.name.trim(),
        startDate: gameConfig.startDate,
        endDate: gameConfig.endDate,
        rule: gameConfig.rule,
        customRules: gameConfig.customRules,
        // "daily" = 1 spin/day, "custom" = the number typed by the owner
        ...(gameConfig.rule === "daily" ? { dailyFreeSpins: 1 } : gameConfig.rule === "custom" ? { dailyFreeSpins: spinsPerDay } : {}),
        firstFree: gameConfig.firstFree,
        conditions: gameConfig.conditions,
        segments: gameConfig.segments.map(s => ({
          label: autoLabel(s) || NO_PRIZE, points: s.type === "points" ? s.points : 0, type: s.type, description: s.description,
          color: s.color, textColor: s.textColor, probability: s.probability, stock: s.stock,
        })),
      };
      if (editingId) payload.id = editingId;
      const res = await fetch("/api/spin-config", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(editingId ? "Jeu mis à jour" : "Jeu créé avec succès");
        closeModal();
        fetchGames();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || "Échec de l'enregistrement");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-transparent"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div></div>;

  const input = "w-full bg-[#2f2843] border border-[#54496b] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]";
  const sectionCard = "bg-[#3b3350] border border-[#4a3f60] rounded-xl p-5";
  const iconBox = "w-9 h-9 rounded-lg bg-[#4a3f60] text-gray-300 flex items-center justify-center shrink-0";

  // ---- display helpers for the new layout (no logic change) ----
  const featured = games.find((g) => g.id === featuredId) ?? games.find((g) => g.isActive) ?? games[0] ?? null;
  const wheelGradient = (g: any) => {
    const total = g.segments.reduce((a: number, b: any) => a + (b.probability || 0), 0) || 100;
    let acc = 0;
    return g.segments.map((sg: any) => {
      const start = (acc / total) * 100; acc += sg.probability || 0;
      return `${sg.color} ${start}% ${(acc / total) * 100}%`;
    }).join(", ");
  };
  const wheelMids = (g: any) => {
    const total = g.segments.reduce((a: number, b: any) => a + (b.probability || 0), 0) || 100;
    let acc = 0;
    return g.segments.map((sg: any) => { const mid = ((acc + (sg.probability || 0) / 2) / total) * 360; acc += sg.probability || 0; return mid; });
  };
  const ruleText = (g: any) =>
    g.rule === "daily" ? "Une fois par jour"
    : g.rule === "custom" ? `Personnalisé · ${g.dailyFreeSpins ?? 3} tour(s) / jour`
    : "Après chaque achat";
  const typeLabel = (sg: any) => PRIZE_TYPES.find((t) => t.type === inferType(sg))?.label ?? "";
  const fmtDay = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");
  const socialLink = slug && typeof window !== "undefined" ? `${window.location.origin}/${slug}` : "";
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(socialLink); toast.success("Lien copié"); }
    catch { toast.error("Impossible de copier le lien"); }
  };
  const cardCls = "bg-[#3b3350] border border-[#4a3f60] rounded-2xl";
  const cardHead = "flex items-center gap-3 px-6 py-4 border-b border-[#4a3f60]";

  const stepItem = (n: number, label: string) => {
    const done = step > n, current = step === n;
    return (
      <div className={`flex items-center gap-2 text-sm font-medium ${done ? "text-green-400" : current ? "text-[#8B5CF6]" : "text-gray-500"}`}>
        {done
          ? <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
          : <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${current ? "bg-[#8B5CF6] text-white" : "bg-[#4a3f60] text-gray-400"}`}>{n}</div>}
        {label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Spin &amp; Win</h1>
          <button onClick={openNewGame} className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Nouveau jeu
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-4 rounded-xl border border-violet-400/30 bg-gradient-to-r from-[#4b3a7a]/70 to-[#5a2f72]/60 p-5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-violet-400/20 text-violet-200 flex items-center justify-center shrink-0"><Dices size={22} /></div>
          <div>
            <h2 className="text-white font-semibold mb-1">Qu&apos;est-ce que Spin &amp; Win ?</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Ajoutez un jeu de roue à votre programme de fidélité. Les clients tournent après chaque tampon ou une fois par jour pour gagner des coupons, des points bonus, des tampons ou des cadeaux — pour les fidéliser et les faire revenir.
            </p>
          </div>
        </div>

        {/* ===== Featured (active) game : details in the middle, wheel + link on the right ===== */}
        {featured && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10 items-start">
            {/* Middle: colors, rules, rewards, conditions */}
            <div className={`xl:col-span-2 ${cardCls} overflow-hidden`}>
              <div className={`${cardHead} justify-between`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0"><Settings2 size={20} /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold text-white truncate">{featured.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${featured.isActive ? "bg-green-500/15 text-green-400" : "bg-gray-500/20 text-gray-300"}`}>{featured.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {featured.segments.length} segments{featured.spinCount > 0 && <span> · {featured.spinCount} tours</span>}
                      {(featured.startDate || featured.endDate) && <span> · {fmtDay(featured.startDate) || "…"} → {fmtDay(featured.endDate) || "…"}</span>}
                    </p>
                  </div>
                </div>
                <Toggle on={featured.isActive} onClick={() => toggleGame(featured)} />
              </div>

              <div className="p-6 space-y-6">
                {/* Rules */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Repeat size={15} className="text-violet-300" /> Règles du jeu</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#2f2843] border border-[#4a3f60] rounded-xl px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Quand peut-on tourner ?</p>
                      <p className="text-white text-sm font-medium">{ruleText(featured)}</p>
                    </div>
                    <div className="bg-[#2f2843] border border-[#4a3f60] rounded-xl px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Premier tour gratuit</p>
                      <p className="text-white text-sm font-medium">{featured.firstFree ? "Oui" : "Non"}</p>
                    </div>
                  </div>
                </div>

                {/* Rewards */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Gift size={15} className="text-violet-300" /> Récompenses</h3>
                  <div className="space-y-2">
                    {featured.segments.map((seg: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#2f2843] border border-[#4a3f60] rounded-xl px-3 py-2.5" style={{ borderLeft: `4px solid ${seg.color}` }}>
                        <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
                        <span className="w-6 h-6 rounded-md shrink-0 border border-white/20" style={{ backgroundColor: seg.color }} />
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isPrize(seg) ? "bg-pink-500/15 text-pink-400" : "bg-[#3b3350] text-gray-400"}`}>
                          {isPrize(seg) ? <Gift size={14} /> : <RotateCcw size={14} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{seg.label}</p>
                          <p className="text-[11px] text-gray-400 truncate">{typeLabel(seg)}{typeof seg.stock === "number" && ` · stock ${seg.stock}`}</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold shrink-0" style={{ color: seg.color }}><Gauge size={13} /> {fmtPct(seg.probability || 0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><ClipboardList size={15} className="text-violet-300" /> Conditions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { key: "installApp", icon: <Smartphone size={16} />, title: "Installer l'application" },
                      { key: "notifications", icon: <Bell size={16} />, title: "Activer les notifications" },
                      { key: "phone", icon: <Phone size={16} />, title: "Lier le téléphone" },
                    ] as const).map((c) => {
                      const on = !!featured.conditions?.[c.key];
                      return (
                        <div key={c.key} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${on ? "bg-violet-500/15 border-violet-400/60" : "bg-[#2f2843] border-[#4a3f60]"}`}>
                          <span className={`p-1.5 rounded-lg shrink-0 ${on ? "bg-[#8B5CF6] text-white" : "bg-[#4a3f60] text-violet-300"}`}>{c.icon}</span>
                          <span className="text-xs font-medium text-white flex-1">{c.title}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${on ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{on ? "Oui" : "Non"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-5 border-t border-[#4a3f60] pt-4">
                  {featured.isActive && (
                    <button onClick={() => openStats(featured)} className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5"><BarChart3 size={15} /> Voir les stats</button>
                  )}
                  <button onClick={() => openEditGame(featured)} className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5"><Pencil size={14} /> Modifier</button>
                  {!featured.isActive && (
                    <button onClick={() => deleteGame(featured)} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5"><Trash2 size={14} /> Supprimer</button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: wheel + social link */}
            <div className="space-y-6">
              <div className={`${cardCls} overflow-hidden`}>
                <div className={cardHead}>
                  <Eye size={20} className="text-violet-300" />
                  <h3 className="text-white font-semibold">Rendu visuel client</h3>
                </div>
                <div className="p-6 flex justify-center">
                  <div className="relative w-60 h-60 mt-3">
                    <div className="w-full h-full rounded-full border-4 border-white/90 shadow-xl" style={{ background: `conic-gradient(${wheelGradient(featured)})` }} />
                    {wheelMids(featured).map((mid: number, idx: number) => (
                      <div key={idx} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${mid - 90}deg)` }}>
                        <span className="absolute top-1/2 left-1/2 -translate-y-1/2 pl-6 text-[11px] font-extrabold uppercase tracking-wide truncate max-w-[110px]" style={{ color: featured.segments[idx].textColor || "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.45)" }}>
                          {featured.segments[idx].label}
                        </span>
                      </div>
                    ))}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full border-4 border-[#4b3a7a]" />
                  </div>
                </div>
              </div>

              <div className={`${cardCls} overflow-hidden`}>
                <div className={cardHead}>
                  <span className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center"><Link2 size={16} /></span>
                  <h3 className="text-white font-semibold">Audience &amp; Diffusion</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Link2 size={15} className="text-violet-300" /> Lien Social Media (Trafic &amp; Acquisition)</p>
                  <div className="flex items-center gap-2 bg-[#2f2843] border border-[#4a3f60] rounded-xl p-1.5">
                    <input readOnly value={socialLink || "Définissez votre lien dans « Personnaliser »"} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-gray-200 outline-none truncate" />
                    <button onClick={copyLink} disabled={!socialLink} className="flex items-center gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-sm font-semibold px-3 py-2 rounded-lg shrink-0"><Copy size={15} /> Copier</button>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Partagez ce lien sur Instagram, Facebook ou WhatsApp pour que vos clients découvrent la roue.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== All games ===== */}
        {games.length > 0 && <h2 className="text-lg font-semibold text-white mb-4">Tous vos jeux</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {games.map((game) => {
            const total = game.segments.reduce((a: number, b: any) => a + (b.probability || 0), 0) || 100;
            let acc = 0;
            const gradient = game.segments.map((s: any) => {
              const start = (acc / total) * 100; acc += s.probability || 0;
              return `${s.color} ${start}% ${(acc / total) * 100}%`;
            }).join(", ");
            return (
              <div key={game.id} onClick={() => setFeaturedId(game.id)} className={`rounded-xl p-5 transition-colors border cursor-pointer ${featured?.id === game.id ? "ring-2 ring-violet-400/70" : ""} ${game.isActive ? "bg-[#3b3350] border-green-600/60" : "bg-[#342c47] border-[#4a3f60] hover:border-[#6b5b8a]"}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${game.isActive ? "bg-green-500" : "bg-gray-500"}`} />
                    <span className="font-semibold text-white truncate">{game.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${game.isActive ? "bg-green-500/15 text-green-400" : "bg-gray-500/20 text-gray-300"}`}>{game.status}</span>
                  </div>
                  <Toggle on={game.isActive} onClick={() => toggleGame(game)} />
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  {game.segments.length} segments{game.spinCount > 0 && <span> · {game.spinCount} tours</span>}
                </p>

                <div className="flex items-start gap-5 mb-5">
                  <div className="relative w-24 h-24 shrink-0 mt-1">
                    <div className="w-full h-full rounded-full border-[3px] border-[#1e1b4b]" style={{ background: `conic-gradient(${gradient})` }} />
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-white/90" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-[3px] border-[#1e1b4b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">Lots à gagner</p>
                    <div className="space-y-1.5">
                      {game.segments.slice(0, 3).map((seg: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isPrize(seg) ? "bg-pink-500/15 text-pink-400" : "bg-[#2f2843] text-gray-400"}`}>
                              {isPrize(seg) ? <Gift size={13} /> : <RotateCcw size={13} />}
                            </span>
                            <span className="text-gray-200 truncate">{seg.label}</span>
                          </div>
                          <span className="text-gray-500 text-xs shrink-0">{fmtPct(seg.probability || 0)}%</span>
                        </div>
                      ))}
                      {game.segments.length > 3 && <p className="text-xs text-gray-500 pl-8">+{game.segments.length - 3} autres</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 border-t border-[#4a3f60] pt-4">
                  {game.isActive && (
                    <button onClick={() => openStats(game)} className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5"><BarChart3 size={15} /> Voir les stats</button>
                  )}
                  <button onClick={() => openEditGame(game)} className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5"><Pencil size={14} /> Modifier</button>
                  {!game.isActive && (
                    <button onClick={() => deleteGame(game)} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5"><Trash2 size={14} /> Supprimer</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= Create / edit modal ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#352d49] border border-[#4a3f60] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">{editingId ? "Modifier le jeu" : "Nouveau jeu roue"}</h2>
                <span className="text-[#8B5CF6] font-semibold uppercase text-xs tracking-wider">Étape {step} sur 3</span>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>

            <div className="px-6">
              <div className="h-1 bg-[#4a3f60] rounded-full overflow-hidden mb-4"><div className="h-full bg-[#8B5CF6] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} /></div>
              <div className="flex items-center gap-6 pb-4 border-b border-[#4a3f60]">
                {stepItem(1, "Paramètres")}{stepItem(2, "Récompenses")}{stepItem(3, "Conditions")}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* ---------- Step 1 ---------- */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className={sectionCard}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={iconBox}><Settings2 size={18} /></div>
                      <div><h3 className="text-white font-semibold leading-tight">Informations</h3><p className="text-xs text-gray-400">Nom et période de votre campagne</p></div>
                    </div>
                    <label className="block text-sm font-medium text-gray-200 mb-1.5">Nom du jeu <span className="text-red-500">*</span></label>
                    <input type="text" value={gameConfig.name} onChange={(e) => setGameConfig({ ...gameConfig, name: e.target.value })} placeholder="ex. Défi d'été" className={input} />

                    <div className="mt-4 pt-3 border-t border-[#4a3f60]">
                      <button type="button" onClick={() => setPlanOpen(!planOpen)} className="w-full flex items-center justify-between text-left">
                        <span className="flex items-center gap-2 text-sm font-medium text-white">
                          <Calendar size={16} className="text-gray-400" /> Planification
                          <span className="text-[11px] bg-[#4a3f60] text-gray-300 px-2 py-0.5 rounded">Facultatif</span>
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${planOpen ? "rotate-180" : ""}`} />
                      </button>
                      {planOpen && (
                        <div className="mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-gray-300 mb-1.5">Début</label><input type="date" value={gameConfig.startDate} onChange={(e) => setGameConfig({ ...gameConfig, startDate: e.target.value })} className={input} /></div>
                            <div><label className="block text-sm text-gray-300 mb-1.5">Fin</label><input type="date" value={gameConfig.endDate} onChange={(e) => setGameConfig({ ...gameConfig, endDate: e.target.value })} className={input} /></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Laissez vide pour lancer immédiatement et sans fin</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={sectionCard}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={iconBox}><Repeat size={18} /></div>
                      <div><h3 className="text-white font-semibold leading-tight">Règles du jeu</h3><p className="text-xs text-gray-400">Quand et à quelle fréquence les clients peuvent jouer</p></div>
                    </div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Quand peut-on tourner ?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["purchase", "daily", "custom"] as const).map((type) => (
                        <button key={type} onClick={() => setGameConfig({ ...gameConfig, rule: type })} className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${gameConfig.rule === type ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-[#2f2843] border-[#54496b] text-gray-300 hover:border-gray-400"}`}>
                          {type === "purchase" && "Après chaque achat"}{type === "daily" && "Une fois par jour"}{type === "custom" && "Personnalisé (X/jour)"}
                        </button>
                      ))}
                    </div>
                    {gameConfig.rule === "custom" && (
                      <div className="mt-4 p-4 rounded-lg bg-[#2f2843] border border-[#54496b]">
                        <label className="block text-sm font-medium text-gray-200 mb-1.5">Nombre de tours par jour et par client</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number" min={1} max={20} step={1} inputMode="numeric"
                            value={gameConfig.spinsPerDay}
                            onChange={(e) => setGameConfig({ ...gameConfig, spinsPerDay: e.target.value })}
                            className={`${input} !w-28 text-center`}
                          />
                          <span className="text-sm text-gray-300">tour(s) / jour</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Chaque client peut tourner la roue ce nombre de fois par jour (entre 1 et 20). Le compteur repart à zéro chaque jour.</p>
                      </div>
                    )}
                    {gameConfig.rule === "daily" && (
                      <p className="text-xs text-gray-400 mt-3">Chaque client peut tourner la roue 1 fois par jour.</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pl-4 border-l-2 border-[#8B5CF6]/60">
                      <div><p className="text-sm font-medium text-white">Premier tour gratuit</p><p className="text-xs text-gray-400">Permettre aux clients de tourner une fois avant leur premier tampon</p></div>
                      <Toggle size="md" on={gameConfig.firstFree} onClick={() => setGameConfig({ ...gameConfig, firstFree: !gameConfig.firstFree })} />
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- Step 2 ---------- */}
              {step === 2 && (
                <div className="flex gap-8 flex-col md:flex-row">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-4 bg-[#3b3350] border border-[#4a3f60] px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-300"><strong className="text-white">{gameConfig.segments.length}</strong>/12 cases <span className="mx-1">·</span> <span className={`font-semibold ${totalOk ? "text-green-400" : "text-amber-400"}`}>Total {fmtPct(parseFloat(totalProb.toFixed(1)))}%</span></span>
                      <button onClick={addSegment} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16} /> Ajouter</button>
                    </div>

                    <div className="space-y-3 mb-5">
                      {gameConfig.segments.map((seg, idx) => {
                        const open = editingSegId === seg.id;
                        const title = autoLabel(seg) || (seg.type === "gift" ? "Cadeau" : "Coupon");
                        return (
                        <div key={seg.id} className="bg-[#3b3350] border border-[#4a3f60] rounded-xl overflow-hidden" style={{ borderLeft: `3px solid ${seg.color}` }}>
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ backgroundColor: seg.color }}>{idx + 1}</div>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <p className="text-white font-semibold truncate">{title}</p>
                              {open && <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color: seg.color, backgroundColor: `${seg.color}22` }}>{seg.probability.toFixed(1)}%</span>}
                              {!open && (
                                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: seg.color }}>
                                  <Gauge size={12} /> {seg.probability.toFixed(1)}%
                                  {seg.stock !== null && <span className="text-gray-400 ml-2">· stock {seg.stock}</span>}
                                </span>
                              )}
                            </div>
                            {!open && <button onClick={() => setEditingSegId(seg.id)} className="p-1.5 rounded-md hover:bg-[#4a3f60] text-gray-400" title="Modifier"><Pencil size={16} /></button>}
                            {open && <button onClick={() => setEditingSegId(null)} className="p-1.5 rounded-md hover:bg-[#4a3f60] text-gray-400" title="Réduire"><ChevronDown size={16} className="rotate-180" /></button>}
                            <button onClick={() => removeSegment(seg.id)} className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-[#4a3f60]" title="Supprimer"><Trash2 size={16} /></button>
                          </div>

                          {open && (
                            <div className="px-4 pb-4 pt-1">
                              <p className="text-sm text-gray-400 mb-2">Type de prix</p>
                              <div className="grid grid-cols-3 gap-2">
                                {PRIZE_TYPES.map(({ type, label, icon: Icon }) => (
                                  <button key={type} onClick={() => patchSegment(seg.id, { type })} className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-semibold border transition-colors ${seg.type === type ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "bg-[#2f2843] border-[#54496b] text-gray-300 hover:border-gray-400"}`}>
                                    <Icon size={18} /> {label}
                                  </button>
                                ))}
                              </div>

                              {seg.type === "points" && (
                                <div className="flex items-center gap-3 mt-4">
                                  <input type="number" min={1} value={seg.points || ""} placeholder="0" onChange={(e) => patchSegment(seg.id, { points: Math.max(0, parseInt(e.target.value) || 0) })} className={input + " !w-32"} />
                                  <span className="text-sm text-gray-400">pts</span>
                                </div>
                              )}

                              {(seg.type === "gift" || seg.type === "coupon") && (
                                <div className="mt-4 space-y-3">
                                  <div>
                                    <label className="block text-sm text-gray-300 mb-1.5">{seg.type === "gift" ? "Nom du cadeau" : "Nom du coupon"}</label>
                                    <input type="text" value={seg.label} onChange={(e) => patchSegment(seg.id, { label: e.target.value })} placeholder={seg.type === "gift" ? "Nom du cadeau (ex. Café gratuit)" : "Nom du coupon (ex. -10% sur la commande)"} className={input} />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-300 mb-1.5">{seg.type === "gift" ? "Description du cadeau" : "Description du coupon"}</label>
                                    <textarea rows={2} value={seg.description} onChange={(e) => patchSegment(seg.id, { description: e.target.value })} placeholder={seg.type === "gift" ? "Décrivez le cadeau (ex. Café gratuit, T-shirt...)" : "Décrivez le coupon et ses conditions"} className={input + " resize-none"} />
                                  </div>
                                </div>
                              )}

                              {seg.type === "free_spin" && (
                                <p className="mt-4 text-xs text-gray-400 bg-[#2f2843]/60 border border-[#54496b] rounded-lg p-3">Le client gagne automatiquement <strong className="text-gray-200">+1 tour gratuit</strong> à ajouter à ses tours.</p>
                              )}

                              <div className="mt-4 pt-4 border-t border-[#4a3f60] grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-200"><Gauge size={14} /> Chance de gagner</span>
                                    <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ color: seg.color, backgroundColor: `${seg.color}22` }}>{seg.probability.toFixed(1)}%</span>
                                  </div>
                                  <input type="range" min={0} max={100} step={0.1} value={seg.probability} onChange={(e) => setChance(seg.id, parseFloat(e.target.value))} className="w-full" style={{ accentColor: seg.color }} />
                                  <p className="text-[11px] text-gray-500 mt-1">Les autres cases s&apos;ajustent automatiquement</p>
                                </div>
                                {seg.type !== "none" && (
                                  <div>
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-200 mb-2"><Trophy size={14} /> Stock du prix</span>
                                    <div className="flex items-center gap-3">
                                      <input type="number" min={0} value={seg.stock ?? ""} placeholder="Illimité" onChange={(e) => patchSegment(seg.id, { stock: e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0) })} className={input + " !py-2"} />
                                      <span className="text-xs text-gray-400">{seg.stock === null ? "illimité" : "restant"}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>

                    <button onClick={() => setShowHelp(!showHelp)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"><HelpCircle size={15} /> Comment fonctionnent la probabilité et le stock ?</button>
                    {showHelp && (
                      <p className="mt-2 text-xs text-gray-400 leading-relaxed bg-[#3b3350] border border-[#4a3f60] rounded-lg p-3">
                        La <strong className="text-gray-200">probabilité</strong> est la chance (en %) qu&apos;un client tombe sur cette case — le total doit faire 100%. Le <strong className="text-gray-200">stock</strong> limite le nombre de fois qu&apos;un lot peut être gagné : quand il atteint 0, la case n&apos;est plus tirée. Laissez le stock vide pour un lot illimité.
                      </p>
                    )}
                  </div>

                  <div className="md:w-60 flex flex-col items-center shrink-0">
                    <canvas ref={canvasRef} width={220} height={228} className="drop-shadow-xl" />
                    <p className="text-xs text-gray-500 mt-2">Aperçu de la roue</p>
                  </div>
                </div>
              )}

              {/* ---------- Step 3 ---------- */}
              {step === 3 && (
                <div className={sectionCard}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={iconBox}><ClipboardList size={18} /></div>
                    <div><h3 className="text-white font-semibold leading-tight">Conditions requises</h3><p className="text-xs text-gray-400">Exiger que les clients complètent ces actions avant de tourner</p></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([
                      { key: "installApp", icon: <Smartphone size={18} />, title: "Installer l'application", desc: "Le client doit ajouter l'application à son écran d'accueil" },
                      { key: "notifications", icon: <Bell size={18} />, title: "Activer les notifications", desc: "Le client doit activer les notifications push" },
                      { key: "phone", icon: <Phone size={18} />, title: "Lier le téléphone", desc: "Le client doit lier son numéro de téléphone et accepter le marketing SMS" },
                    ] as const).map((c) => {
                      const on = gameConfig.conditions[c.key];
                      return (
                        <div key={c.key} className={`flex items-start gap-3 p-4 rounded-xl bg-[#2f2843]/60 border ${on ? "border-[#8B5CF6]" : "border-[#54496b]"}`}>
                          <div className={`p-2 rounded-lg shrink-0 ${on ? "bg-[#8B5CF6] text-white" : "bg-[#4a3f60] text-violet-300"}`}>{c.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-white font-semibold text-sm">{c.title}</h4>
                              <Toggle size="sm" on={on} onClick={() => setGameConfig({ ...gameConfig, conditions: { ...gameConfig.conditions, [c.key]: !on } })} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#4a3f60] flex justify-between items-center">
              <button onClick={() => (step > 1 ? setStep(step - 1) : closeModal())} className="text-gray-300 hover:text-white flex items-center gap-1 text-sm font-medium px-2 py-2">
                {step === 1 ? "Annuler" : <><ChevronLeft size={16} /> Retour</>}
              </button>
              {step < 3 ? (
                <button onClick={goNext} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2">Continuer <ChevronRight size={18} /></button>
              ) : (
                <button onClick={handleSave} disabled={saving} className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold">
                  {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer le jeu"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= Stats modal ================= */}
      {statsGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setStatsGame(null); }}>
          <div className="bg-[#352d49] border border-[#4a3f60] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-start">
              <div><h2 className="text-xl font-semibold text-white">Statistiques</h2><p className="text-sm text-gray-400 mt-1">{statsGame.name}</p></div>
              <button onClick={() => setStatsGame(null)} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>
            <div className="px-6 pb-6">
              {statsLoading || !stats ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Tours joués", value: stats.totalSpins },
                      { label: "7 derniers jours", value: stats.spinsLast7Days },
                      { label: "Joueurs uniques", value: stats.uniquePlayers },
                      { label: "Points distribués", value: stats.pointsAwarded },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#3b3350] border border-[#4a3f60] rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Lots gagnés</p>
                  {stats.prizes.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucun tour joué pour le moment.</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.prizes.map((p) => (
                        <div key={p.label}>
                          <div className="flex justify-between text-sm mb-1"><span className="text-gray-200 truncate">{p.label}</span><span className="text-gray-400">{p.count}</span></div>
                          <div className="h-1.5 bg-[#4a3f60] rounded-full overflow-hidden"><div className="h-full bg-[#8B5CF6]" style={{ width: `${(p.count / stats.totalSpins) * 100}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}