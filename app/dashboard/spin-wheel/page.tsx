"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Trash2, RotateCw, X, Settings, Gift, CheckCircle2,
  Smartphone, Bell, PhoneCall, Edit2, Calendar, ChevronRight, Info, RefreshCw,
} from "lucide-react";

type Segment = {
  id: string;
  label: string;
  points: number;
  probability: number;
  color: string;
  textColor: string;
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

const PRESET_COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16"];

export default function SpinWheelConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [gameConfig, setGameConfig] = useState<GameConfig>({
    name: "",
    startDate: "",
    endDate: "",
    rule: "purchase",
    customRules: "",
    firstFree: true,
    segments: [
      { id: "1", label: "Pas de prix", points: 0, probability: 50, color: PRESET_COLORS[0], textColor: "#ffffff" },
      { id: "2", label: "Pas de prix", points: 0, probability: 50, color: PRESET_COLORS[1], textColor: "#ffffff" },
    ],
    conditions: { installApp: false, notifications: false, phone: true },
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/spin-config");
      const data = await res.json();
      if (res.ok) {
        if (data.segments && data.segments.length > 0) {
          const formattedSegments = data.segments.map((s: any, i: number) => ({
            id: Date.now().toString() + i,
            label: s.label,
            points: s.points,
            probability: s.probability || parseFloat((100 / data.segments.length).toFixed(1)),
            color: s.color,
            textColor: s.textColor || "#ffffff",
          }));
          setGameConfig(prev => ({ ...prev, segments: formattedSegments }));
        }
        setGames([{
          id: "1",
          name: "Ma Roue Principale",
          status: data.isActive ? "Active" : "Brouillon",
          segments: data.segments || gameConfig.segments,
        }]);
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameConfig.segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 220, cx = size / 2, cy = size / 2, R = 104;
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, size, size);

    gameConfig.segments.forEach((seg) => {
      const arcSize = (seg.probability / 100) * (2 * Math.PI);
      const endAngle = startAngle + arcSize;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, startAngle, endAngle); ctx.closePath();
      ctx.fillStyle = seg.color; ctx.fill();
      ctx.strokeStyle = "#1F2937"; ctx.lineWidth = 2; ctx.stroke();

      ctx.save(); ctx.translate(cx, cy); ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = "right"; ctx.font = "600 11px Inter, sans-serif"; ctx.fillStyle = seg.textColor;
      ctx.fillText(seg.label, R - 10, 4); ctx.restore();
      startAngle = endAngle;
    });

    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = "#111827"; ctx.fill();
    ctx.strokeStyle = "#3B82F6"; ctx.lineWidth = 2; ctx.stroke();
  }, [gameConfig.segments]);

  useEffect(() => {
    if (isModalOpen && step === 2) setTimeout(drawPreview, 50);
  }, [drawPreview, isModalOpen, step, gameConfig.segments]);

  const addSegment = () => {
    if (gameConfig.segments.length >= 12) return toast.error("Maximum 12 segments");
    const newProb = parseFloat((100 / (gameConfig.segments.length + 1)).toFixed(1));
    const updated = gameConfig.segments.map(s => ({ ...s, probability: newProb }));
    updated.push({ id: Date.now().toString(), label: "Pas de prix", points: 0, probability: newProb, color: PRESET_COLORS[updated.length % PRESET_COLORS.length], textColor: "#ffffff" });
    const total = updated.reduce((acc, curr) => acc + curr.probability, 0);
    if (total !== 100) updated[updated.length - 1].probability = parseFloat((updated[updated.length - 1].probability + (100 - total)).toFixed(1));
    setGameConfig({ ...gameConfig, segments: updated });
  };

  const removeSegment = (id: string) => {
    if (gameConfig.segments.length <= 2) return toast.error("La roue doit avoir au moins 2 segments");
    let updated = gameConfig.segments.filter(s => s.id !== id);
    const newProb = parseFloat((100 / updated.length).toFixed(1));
    updated = updated.map(s => ({ ...s, probability: newProb }));
    const total = updated.reduce((acc, curr) => acc + curr.probability, 0);
    if (total !== 100) updated[0].probability = parseFloat((updated[0].probability + (100 - total)).toFixed(1));
    setGameConfig({ ...gameConfig, segments: updated });
  };

  const updateProbability = (id: string, newVal: number) => {
    const updated = gameConfig.segments.map(s => s.id === id ? { ...s, probability: newVal } : s);
    setGameConfig({ ...gameConfig, segments: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        isActive: true,
        dailyFreeSpins: 3,
        bonusSpinsPerVisit: 1,
        segments: gameConfig.segments.map(s => ({
          label: s.label, points: s.points, color: s.color, textColor: s.textColor, probability: s.probability
        }))
      };
      const res = await fetch("/api/spin-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success("Roue mise à jour avec succès");
        setIsModalOpen(false); setStep(1); fetchConfig();
      } else {
        toast.error("Échec de l'enregistrement");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#0B0F19]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div></div>;

  return (
    <div className="min-h-screen bg-[#2e283d] text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2">Spin & Win</h1>
            <p className="text-sm text-gray-400 mt-1">Gérez vos jeux de roue et vos campagnes</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Nouveau jeu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-[#374151] transition-colors relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${game.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="font-medium text-white">{game.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${game.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>{game.status}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">{game.segments.length} segments</p>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#1F2937]">
                  <div className="w-full h-full" style={{ background: `conic-gradient(${game.segments.map((s: any, i: number) => {
                    let start = game.segments.slice(0, i).reduce((a: number, b: any) => a + (b.probability || 0), 0);
                    return `${s.color} ${start}% ${start + (s.probability || 0)}%`;
                  }).join(', ')})` }} />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111827] rounded-full border-2 border-gray-800" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Lots à gagner</p>
                  <div className="space-y-2">
                    {game.segments.slice(0, 3).map((seg: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          {seg.label === 'Pas de prix' ? <X size={12} className="text-gray-500" /> : <Gift size={12} className="text-pink-400" />}
                          <span className="text-gray-300 truncate max-w-[80px]">{seg.label}</span>
                        </div>
                        <span className="text-gray-500">{seg.probability || 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 border-t border-[#1F2937] pt-4">
                <button onClick={() => setIsModalOpen(true)} className="text-sm text-gray-400 hover:text-white flex items-center gap-1"><Edit2 size={14} /> Modifier</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#1F2937] flex justify-between items-center">
              <div><h2 className="text-xl font-semibold text-white mb-4">Nouveau jeu roue</h2><span className="text-[#3B82F6] font-medium uppercase text-xs tracking-wider">Étape {step} sur 3</span></div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 mb-2"><div className="flex-1 h-1 bg-[#1F2937] rounded-full overflow-hidden"><div className="h-full bg-[#3B82F6] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} /></div></div>
              <div className="flex items-center gap-6 mb-6">
                <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-[#3B82F6]' : 'text-gray-500'}`}>{step > 1 ? <CheckCircle2 size={16} /> : <div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs">1</div>}Paramètres</div>
                <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-[#3B82F6]' : 'text-gray-500'}`}>{step > 2 ? <CheckCircle2 size={16} /> : <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#3B82F6] text-white' : 'bg-[#1F2937] text-gray-400'}`}>2</div>}Récompenses</div>
                <div className={`flex items-center gap-2 text-sm ${step >= 3 ? 'text-[#3B82F6]' : 'text-gray-500'}`}><div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#3B82F6] text-white' : 'bg-[#1F2937] text-gray-400'}`}>3</div>Conditions</div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-[#1F2937]/50 border border-[#374151] rounded-xl p-5">
                    <h3 className="flex items-center gap-2 text-white font-medium mb-4"><Settings size={18} className="text-gray-400" /> Informations</h3>
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-300 mb-1">Nom du jeu <span className="text-red-500">*</span></label><input type="text" value={gameConfig.name} onChange={(e) => setGameConfig({...gameConfig, name: e.target.value})} placeholder="ex. Défi d'été" className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6]" /></div>
                      <div><label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2"><Calendar size={14} /> Planification <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Facultatif</span></label><div className="flex gap-4"><input type="date" value={gameConfig.startDate} onChange={(e) => setGameConfig({...gameConfig, startDate: e.target.value})} className="w-1/2 bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-gray-300 text-sm" /><input type="date" value={gameConfig.endDate} onChange={(e) => setGameConfig({...gameConfig, endDate: e.target.value})} className="w-1/2 bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-gray-300 text-sm" /></div><p className="text-xs text-gray-500 mt-2">Laissez vide pour lancer immédiatement et sans fin</p></div>
                    </div>
                  </div>
                  <div className="bg-[#1F2937]/50 border border-[#374151] rounded-xl p-5">
                    <h3 className="flex items-center gap-2 text-white font-medium mb-1"><RefreshCw size={18} className="text-gray-400" /> Règles du jeu</h3>
                    <div className="mb-4"><label className="block text-sm font-medium text-gray-300 mb-2">Quand peut-on tourner ?</label><div className="grid grid-cols-3 gap-3">{['purchase', 'daily', 'custom'].map((type) => (<button key={type} onClick={() => setGameConfig({...gameConfig, rule: type as any})} className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${gameConfig.rule === type ? 'bg-[#3B82F6] border-[#3B82F6] text-white' : 'bg-[#111827] border-[#374151] text-gray-400 hover:border-gray-500'}`}>{type === 'purchase' && 'Après chaque achat'}{type === 'daily' && 'Une fois par jour'}{type === 'custom' && 'Personnalisé (X/jour)'}</button>))}</div></div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#374151] mt-4"><div><p className="text-sm font-medium text-white">Premier tour gratuit</p><p className="text-xs text-gray-500">Permettre aux clients de tourner une fois avant leur premier tampon</p></div><div onClick={() => setGameConfig({...gameConfig, firstFree: !gameConfig.firstFree})} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${gameConfig.firstFree ? 'bg-[#3B82F6]' : 'bg-[#374151]'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.firstFree ? 'left-6' : 'left-1'}`}></div></div></div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex gap-8">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-4 bg-[#1F2937]/50 border border-[#374151] p-3 rounded-xl">
                      <span className="text-sm text-gray-300"><strong className="text-white">{gameConfig.segments.length}</strong>/12 cases</span>
                      <div className="flex items-center gap-3"><span className="text-sm text-gray-300">Total <strong className="text-green-400">{gameConfig.segments.reduce((a,b)=>a+b.probability, 0).toFixed(1)}%</strong></span><button onClick={addSegment} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16} /> Ajouter</button></div>
                    </div>
                    <div className="space-y-3 mb-6">
                      {gameConfig.segments.map((seg, idx) => (
                        <div key={seg.id} className="flex items-center gap-3 bg-[#1F2937]/50 border border-[#374151] rounded-xl p-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ backgroundColor: seg.color }}>{idx + 1}</div>
                          <div className="flex-1 min-w-0">
                            <input type="text" value={seg.label} onChange={(e) => setGameConfig({...gameConfig, segments: gameConfig.segments.map(s => s.id === seg.id ? {...s, label: e.target.value} : s)})} className="bg-transparent text-white text-sm font-medium w-full focus:outline-none border-b border-transparent focus:border-gray-500 pb-0.5" />
                            <div className="flex items-center gap-2 mt-1"><input type="number" value={seg.probability} onChange={(e) => updateProbability(seg.id, parseFloat(e.target.value) || 0)} className="bg-transparent text-xs text-gray-400 w-12 focus:outline-none border-b border-transparent focus:border-gray-500" /><span className="text-xs text-gray-400">%</span></div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0"><input type="color" value={seg.color} onChange={(e) => setGameConfig({...gameConfig, segments: gameConfig.segments.map(s => s.id === seg.id ? {...s, color: e.target.value} : s)})} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" /><Trash2 size={16} className="cursor-pointer text-gray-500 hover:text-red-400" onClick={() => removeSegment(seg.id)} /></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><Info size={14} /> Comment fonctionnent la probabilité et le stock ?</div>
                  </div>
                  <div className="w-64 flex flex-col items-center">
                    <div className="w-full bg-[#1F2937]/30 border border-[#374151] rounded-xl p-6 flex flex-col items-center"><canvas ref={canvasRef} width={220} height={220} className="rounded-full drop-shadow-xl" /><div className="mt-4 flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto">{gameConfig.segments.map((seg, i) => (<div key={i} className="flex items-center gap-1 text-[10px] text-gray-400"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}/><span className="truncate max-w-[60px]">{seg.label}</span></div>))}</div></div>
                    <p className="text-xs text-gray-500 mt-3">Aperçu de la roue</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-[#1F2937]/50 border border-[#374151] rounded-xl p-5">
                  <h3 className="flex items-center gap-2 text-white font-medium mb-1"><CheckCircle2 size={18} className="text-gray-400" /> Conditions requises</h3>
                  <p className="text-sm text-gray-400 mb-6">Exiger que les clients complètent ces actions avant de tourner</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#374151] p-4 rounded-xl"><div className="bg-[#1F2937] p-2 rounded-lg text-blue-400 shrink-0"><Smartphone size={20} /></div><div className="flex-1"><div className="flex justify-between items-center mb-1"><h4 className="text-white font-medium text-sm">Installer l'application</h4><div onClick={() => setGameConfig({...gameConfig, conditions: {...gameConfig.conditions, installApp: !gameConfig.conditions.installApp}})} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${gameConfig.conditions.installApp ? 'bg-[#3B82F6]' : 'bg-gray-600'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.conditions.installApp ? 'left-[18px]' : 'left-0.5'}`}></div></div></div><p className="text-xs text-gray-400">Le client doit ajouter l'application à son écran d'accueil</p></div></div>
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#374151] p-4 rounded-xl"><div className="bg-[#1F2937] p-2 rounded-lg text-blue-400 shrink-0"><Bell size={20} /></div><div className="flex-1"><div className="flex justify-between items-center mb-1"><h4 className="text-white font-medium text-sm">Activer les notifications</h4><div onClick={() => setGameConfig({...gameConfig, conditions: {...gameConfig.conditions, notifications: !gameConfig.conditions.notifications}})} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${gameConfig.conditions.notifications ? 'bg-[#3B82F6]' : 'bg-gray-600'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.conditions.notifications ? 'left-[18px]' : 'left-0.5'}`}></div></div></div><p className="text-xs text-gray-400">Le client doit activer les notifications push</p></div></div>
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#3B82F6] p-4 rounded-xl col-span-2"><div className="bg-[#1F2937] p-2 rounded-lg text-blue-400 shrink-0"><PhoneCall size={20} /></div><div className="flex-1"><div className="flex justify-between items-center mb-1"><h4 className="text-white font-medium text-sm">Lier le téléphone</h4><div onClick={() => setGameConfig({...gameConfig, conditions: {...gameConfig.conditions, phone: !gameConfig.conditions.phone}})} className={`w-9 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${gameConfig.conditions.phone ? 'bg-[#3B82F6]' : 'bg-gray-600'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.conditions.phone ? 'left-[18px]' : 'left-0.5'}`}></div></div></div><p className="text-xs text-gray-400">Le client doit lier son numéro de téléphone et accepter le marketing SMS</p></div></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#1F2937] flex justify-between items-center bg-[#111827]">
              <button onClick={() => step > 1 ? setStep(step - 1) : setIsModalOpen(false)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium px-4 py-2">{step === 1 ? 'Annuler' : '< Retour'}</button>
              {step < 3 ? (<button onClick={() => setStep(step + 1)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2">Continuer <ChevronRight size={18} /></button>) : (<button onClick={handleSave} disabled={saving} className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium">{saving ? "Création..." : "Créer le jeu"}</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}