"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, X, Settings2, Gift, Check, Smartphone, Bell, Phone, Pencil,
  Calendar, ChevronRight, ChevronLeft, ChevronDown, HelpCircle, Repeat, Gauge,
  RotateCcw, BarChart3, Dices, ClipboardList,
} from "lucide-react";

type Segment = {
  id: string;
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

const PRESET_COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#3B82F6", "#14B8A6", "#F97316", "#84CC16"];
const NO_PRIZE = "Pas de prix";

const emptyGame = (): GameConfig => ({
  name: "",
  startDate: "",
  endDate: "",
  rule: "purchase",
  customRules: "",
  firstFree: true,
  segments: [
    { id: "1", label: NO_PRIZE, points: 0, probability: 50, color: PRESET_COLORS[0], textColor: "#ffffff", stock: null },
    { id: "2", label: NO_PRIZE, points: 0, probability: 50, color: PRESET_COLORS[1], textColor: "#ffffff", stock: null },
  ],
  conditions: { installApp: false, notifications: false, phone: true },
});

const toDateInput = (d: string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const isPrize = (s: { label: string; points: number }) => s.points > 0 || (s.label !== NO_PRIZE && s.label !== "Réessayer");
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
      className={`${w} rounded-full relative cursor-pointer transition-colors shrink-0 ${on ? (size === "md" ? "bg-green-500" : "bg-[#3B82F6]") : "bg-[#3b475f]"}`}
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
    const apply = (active: boolean) =>
      setGames(prev => prev.map(g => g.id === game.id ? { ...g, isActive: active, status: active ? "Active" : "Brouillon" } : g));
    apply(next);
    try {
      const res = await fetch("/api/spin-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: game.id, isActive: next }) });
      if (!res.ok) throw new Error();
      toast.success(next ? "Jeu activé" : "Jeu désactivé");
    } catch {
      apply(!next);
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
    ctx.strokeStyle = "#312e81"; ctx.lineWidth = 2; ctx.stroke();

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
        const txt = seg.label.length > 8 ? seg.label.slice(0, 7) + "…" : seg.label;
        ctx.fillText(txt, R - 10, 3); ctx.restore();
      }
      startAngle = endAngle;
    });

    // hub
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#6366F1"; ctx.fill();

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
      id: Date.now().toString(), label: NO_PRIZE, points: 0, probability: 0,
      color: PRESET_COLORS[gameConfig.segments.length % PRESET_COLORS.length], textColor: "#ffffff", stock: null,
    }];
    setGameConfig({ ...gameConfig, segments: redistribute(list) });
  };

  const removeSegment = (id: string) => {
    if (gameConfig.segments.length <= 2) return toast.error("La roue doit avoir au moins 2 segments");
    setGameConfig({ ...gameConfig, segments: redistribute(gameConfig.segments.filter(s => s.id !== id)) });
    if (editingSegId === id) setEditingSegId(null);
  };

  const patchSegment = (id: string, patch: Partial<Segment>) =>
    setGameConfig(g => ({ ...g, segments: g.segments.map(s => s.id === id ? { ...s, ...patch } : s) }));

  const totalProb = gameConfig.segments.reduce((a, b) => a + b.probability, 0);
  const totalOk = Math.abs(totalProb - 100) < 0.5;

  /* ---------- wizard navigation ---------- */
  const goNext = () => {
    if (step === 1 && !gameConfig.name.trim()) return toast.error("Le nom du jeu est obligatoire");
    if (step === 1 && gameConfig.startDate && gameConfig.endDate && gameConfig.endDate < gameConfig.startDate) {
      return toast.error("La date de fin doit être après la date de début");
    }
    if (step === 2 && !totalOk) return toast.error("Le total des probabilités doit être égal à 100%");
    setStep(step + 1);
  };

  const handleSave = async () => {
    if (!gameConfig.name.trim()) { setStep(1); return toast.error("Le nom du jeu est obligatoire"); }
    if (!totalOk) { setStep(2); return toast.error("Le total des probabilités doit être égal à 100%"); }
    setSaving(true);
    try {
      const payload: any = {
        name: gameConfig.name.trim(),
        startDate: gameConfig.startDate,
        endDate: gameConfig.endDate,
        rule: gameConfig.rule,
        customRules: gameConfig.customRules,
        firstFree: gameConfig.firstFree,
        conditions: gameConfig.conditions,
        segments: gameConfig.segments.map(s => ({
          label: s.label, points: s.points, color: s.color, textColor: s.textColor, probability: s.probability, stock: s.stock,
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

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#0f172a]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div></div>;

  const input = "w-full bg-[#2a3550] border border-[#3b475f] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]";
  const sectionCard = "bg-[#212b3f] border border-[#2f3b52] rounded-xl p-5";
  const iconBox = "w-9 h-9 rounded-lg bg-[#2f3b52] text-gray-300 flex items-center justify-center shrink-0";

  const stepItem = (n: number, label: string) => {
    const done = step > n, current = step === n;
    return (
      <div className={`flex items-center gap-2 text-sm font-medium ${done ? "text-green-400" : current ? "text-[#3B82F6]" : "text-gray-500"}`}>
        {done
          ? <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
          : <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${current ? "bg-[#3B82F6] text-white" : "bg-[#2f3b52] text-gray-400"}`}>{n}</div>}
        {label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Spin &amp; Win</h1>
          <button onClick={openNewGame} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Nouveau jeu
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 to-purple-950/60 p-5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0"><Dices size={22} /></div>
          <div>
            <h2 className="text-white font-semibold mb-1">Qu&apos;est-ce que Spin &amp; Win ?</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Ajoutez un jeu de roue à votre programme de fidélité. Les clients tournent après chaque tampon ou une fois par jour pour gagner des coupons, des points bonus, des tampons ou des cadeaux — pour les fidéliser et les faire revenir.
            </p>
          </div>
        </div>

        {/* Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {games.map((game) => {
            const total = game.segments.reduce((a: number, b: any) => a + (b.probability || 0), 0) || 100;
            let acc = 0;
            const gradient = game.segments.map((s: any) => {
              const start = (acc / total) * 100; acc += s.probability || 0;
              return `${s.color} ${start}% ${(acc / total) * 100}%`;
            }).join(", ");
            return (
              <div key={game.id} className={`rounded-xl p-5 transition-colors border ${game.isActive ? "bg-[#0f1c2e] border-green-600/60" : "bg-[#111a2e] border-[#243049] hover:border-[#334566]"}`}>
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
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isPrize(seg) ? "bg-pink-500/15 text-pink-400" : "bg-[#1e293b] text-gray-400"}`}>
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

                <div className="flex items-center gap-5 border-t border-[#243049] pt-4">
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
          <div className="bg-[#1c2536] border border-[#2f3b52] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">{editingId ? "Modifier le jeu" : "Nouveau jeu roue"}</h2>
                <span className="text-[#3B82F6] font-semibold uppercase text-xs tracking-wider">Étape {step} sur 3</span>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>

            <div className="px-6">
              <div className="h-1 bg-[#2f3b52] rounded-full overflow-hidden mb-4"><div className="h-full bg-[#3B82F6] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} /></div>
              <div className="flex items-center gap-6 pb-4 border-b border-[#2f3b52]">
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

                    <div className="mt-4 pt-3 border-t border-[#2f3b52]">
                      <button type="button" onClick={() => setPlanOpen(!planOpen)} className="w-full flex items-center justify-between text-left">
                        <span className="flex items-center gap-2 text-sm font-medium text-white">
                          <Calendar size={16} className="text-gray-400" /> Planification
                          <span className="text-[11px] bg-[#2f3b52] text-gray-300 px-2 py-0.5 rounded">Facultatif</span>
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
                        <button key={type} onClick={() => setGameConfig({ ...gameConfig, rule: type })} className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${gameConfig.rule === type ? "bg-[#3B82F6] border-[#3B82F6] text-white" : "bg-[#2a3550] border-[#3b475f] text-gray-300 hover:border-gray-400"}`}>
                          {type === "purchase" && "Après chaque achat"}{type === "daily" && "Une fois par jour"}{type === "custom" && "Personnalisé (X/jour)"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pl-4 border-l-2 border-[#3B82F6]/60">
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
                    <div className="flex justify-between items-center mb-4 bg-[#212b3f] border border-[#2f3b52] px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-300"><strong className="text-white">{gameConfig.segments.length}</strong>/12 cases <span className="mx-1">·</span> <span className={`font-semibold ${totalOk ? "text-green-400" : "text-amber-400"}`}>Total {fmtPct(parseFloat(totalProb.toFixed(1)))}%</span></span>
                      <button onClick={addSegment} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16} /> Ajouter</button>
                    </div>

                    <div className="space-y-3 mb-5">
                      {gameConfig.segments.map((seg, idx) => (
                        <div key={seg.id} className="bg-[#212b3f] border border-[#2f3b52] rounded-xl overflow-hidden" style={{ borderLeft: `3px solid ${seg.color}` }}>
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ backgroundColor: seg.color }}>{idx + 1}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">{seg.label || NO_PRIZE}</p>
                              <p className="flex items-center gap-1 text-xs font-medium mt-0.5" style={{ color: seg.color }}>
                                <Gauge size={12} /> {seg.probability.toFixed(1)}%
                                {seg.stock !== null && <span className="text-gray-400 ml-2">· stock {seg.stock}</span>}
                              </p>
                            </div>
                            <button onClick={() => setEditingSegId(editingSegId === seg.id ? null : seg.id)} className={`p-1.5 rounded-md hover:bg-[#2f3b52] ${editingSegId === seg.id ? "text-white" : "text-gray-400"}`} title="Modifier"><Pencil size={16} /></button>
                            <button onClick={() => removeSegment(seg.id)} className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-[#2f3b52]" title="Supprimer"><Trash2 size={16} /></button>
                          </div>

                          {editingSegId === seg.id && (
                            <div className="px-4 pb-4 pt-3 border-t border-[#2f3b52] grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Nom du lot</label>
                                <input type="text" value={seg.label} onChange={(e) => patchSegment(seg.id, { label: e.target.value })} className={input + " !py-2 text-sm"} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Points offerts (0 = pas de prix)</label>
                                <input type="number" min={0} value={seg.points} onChange={(e) => patchSegment(seg.id, { points: Math.max(0, parseInt(e.target.value) || 0) })} className={input + " !py-2 text-sm"} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Probabilité (%)</label>
                                <input type="number" min={0} max={100} step={0.1} value={seg.probability} onChange={(e) => patchSegment(seg.id, { probability: Math.max(0, parseFloat(e.target.value) || 0) })} className={input + " !py-2 text-sm"} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Stock (vide = illimité)</label>
                                <input type="number" min={0} value={seg.stock ?? ""} placeholder="Illimité" onChange={(e) => patchSegment(seg.id, { stock: e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0) })} className={input + " !py-2 text-sm"} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Couleur</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {PRESET_COLORS.map((c) => (
                                    <button key={c} onClick={() => patchSegment(seg.id, { color: c })} className={`w-6 h-6 rounded-full border-2 ${seg.color.toLowerCase() === c.toLowerCase() ? "border-white" : "border-transparent"}`} style={{ backgroundColor: c }} />
                                  ))}
                                  <input type="color" value={seg.color} onChange={(e) => patchSegment(seg.id, { color: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button onClick={() => setShowHelp(!showHelp)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"><HelpCircle size={15} /> Comment fonctionnent la probabilité et le stock ?</button>
                    {showHelp && (
                      <p className="mt-2 text-xs text-gray-400 leading-relaxed bg-[#212b3f] border border-[#2f3b52] rounded-lg p-3">
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
                        <div key={c.key} className={`flex items-start gap-3 p-4 rounded-xl bg-[#2a3550]/60 border ${on ? "border-[#3B82F6]" : "border-[#3b475f]"}`}>
                          <div className={`p-2 rounded-lg shrink-0 ${on ? "bg-[#3B82F6] text-white" : "bg-[#2f3b52] text-blue-300"}`}>{c.icon}</div>
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

            <div className="px-6 py-4 border-t border-[#2f3b52] flex justify-between items-center">
              <button onClick={() => (step > 1 ? setStep(step - 1) : closeModal())} className="text-gray-300 hover:text-white flex items-center gap-1 text-sm font-medium px-2 py-2">
                {step === 1 ? "Annuler" : <><ChevronLeft size={16} /> Retour</>}
              </button>
              {step < 3 ? (
                <button onClick={goNext} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2">Continuer <ChevronRight size={18} /></button>
              ) : (
                <button onClick={handleSave} disabled={saving} className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold">
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
          <div className="bg-[#1c2536] border border-[#2f3b52] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-start">
              <div><h2 className="text-xl font-semibold text-white">Statistiques</h2><p className="text-sm text-gray-400 mt-1">{statsGame.name}</p></div>
              <button onClick={() => setStatsGame(null)} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>
            <div className="px-6 pb-6">
              {statsLoading || !stats ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Tours joués", value: stats.totalSpins },
                      { label: "7 derniers jours", value: stats.spinsLast7Days },
                      { label: "Joueurs uniques", value: stats.uniquePlayers },
                      { label: "Points distribués", value: stats.pointsAwarded },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#212b3f] border border-[#2f3b52] rounded-xl p-4">
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
                          <div className="h-1.5 bg-[#2f3b52] rounded-full overflow-hidden"><div className="h-full bg-[#6366F1]" style={{ width: `${(p.count / stats.totalSpins) * 100}%` }} /></div>
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