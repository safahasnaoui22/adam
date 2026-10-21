"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Settings,
  Gift,
  CheckCircle2,
  Smartphone,
  Bell,
  PhoneCall,
  Edit2,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Info,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// --- Types ---
type Segment = {
  id: number;
  label: string;
  probability: number;
  color: string;
};

type GameConfig = {
  name: string;
  startDate: string;
  endDate: string;
  rule: "purchase" | "daily" | "custom";
  customRules: string;
  firstFree: boolean;
  segments: Segment[];
  conditions: {
    installApp: boolean;
    notifications: boolean;
    phone: boolean;
  };
};

// --- Mock Data for Dashboard ---
const INITIAL_GAMES = [
  {
    id: 1,
    name: "safa",
    status: "Active",
    segments: [
      { id: 1, label: "Pas de prix", probability: 10, color: "#9CA3AF" },
      { id: 2, label: "Pas de prix", probability: 10, color: "#6B7280" },
      { id: 3, label: "mlawi", probability: 80, color: "#8B5CF6" },
    ],
  },
];

const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16"];

export default function SpinWheelApp() {
  const [games, setGames] = useState(INITIAL_GAMES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  // Game creation state
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    name: "",
    startDate: "",
    endDate: "",
    rule: "purchase",
    customRules: "",
    firstFree: true,
    segments: [
      { id: 1, label: "Pas de prix", probability: 50, color: COLORS[0] },
      { id: 2, label: "Pas de prix", probability: 50, color: COLORS[1] },
    ],
    conditions: {
      installApp: false,
      notifications: false,
      phone: true,
    },
  });

  // --- Handlers ---
  const handleCreateGame = () => {
    const newGame = {
      id: Date.now(),
      name: gameConfig.name || "Nouveau jeu",
      status: "Active",
      segments: gameConfig.segments,
    };
    setGames([newGame, ...games]);
    setIsModalOpen(false);
    setStep(1); // Reset for next time
  };

  const addSegment = () => {
    if (gameConfig.segments.length >= 12) return;
    const newProb = 100 / (gameConfig.segments.length + 1);
    const updatedSegments = gameConfig.segments.map(s => ({ ...s, probability: parseFloat(newProb.toFixed(1)) }));
    updatedSegments.push({
      id: Date.now(),
      label: "Pas de prix",
      probability: parseFloat(newProb.toFixed(1)),
      color: COLORS[updatedSegments.length % COLORS.length],
    });
    // Adjust last item to make exactly 100
    const total = updatedSegments.reduce((acc, curr) => acc + curr.probability, 0);
    if (total !== 100) updatedSegments[updatedSegments.length - 1].probability += (100 - total);

    setGameConfig({ ...gameConfig, segments: updatedSegments });
  };

  const removeSegment = (id: number) => {
    if (gameConfig.segments.length <= 2) return;
    let updatedSegments = gameConfig.segments.filter(s => s.id !== id);
    const newProb = 100 / updatedSegments.length;
    updatedSegments = updatedSegments.map(s => ({ ...s, probability: parseFloat(newProb.toFixed(1)) }));
    
    // Fix rounding errors
    const total = updatedSegments.reduce((acc, curr) => acc + curr.probability, 0);
    if (total !== 100) updatedSegments[0].probability += (100 - total);

    setGameConfig({ ...gameConfig, segments: updatedSegments });
  };

  const updateProbability = (id: number, value: number) => {
    // Note: A robust implementation requires complex balancing logic to keep total at 100%
    // For this UI, we'll just update the specific value
    const updated = gameConfig.segments.map(s => s.id === id ? { ...s, probability: value } : s);
    setGameConfig({ ...gameConfig, segments: updated });
  };

  // --- Sub-components ---

  const PieChart = ({ segments, size = 120 }: { segments: Segment[], size?: number }) => {
    let cumulativePercent = 0;
    
    // SVG Pie Chart generation
    const getCoordinatesForPercent = (percent: number) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    return (
      <div className="relative group" style={{ width: size, height: size }}>
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full drop-shadow-xl">
          {segments.map((segment, i) => {
            const startPercent = cumulativePercent;
            const percent = segment.probability / 100;
            cumulativePercent += percent;
            
            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return (
              <path
                key={i}
                d={pathData}
                fill={segment.color}
                stroke="#1F2937"
                strokeWidth="0.02"
              />
            );
          })}
        </svg>
        {/* Center pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-gray-800 shadow-sm" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 p-8 font-sans">
      
      {/* --- DASHBOARD VIEW --- */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Spin & Win</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> Nouveau jeu
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#111827] border border-[#374151] rounded-xl p-5 mb-8 flex gap-4">
          <div className="bg-[#1F2937] p-3 rounded-lg h-fit">
            <Gift className="text-[#8B5CF6]" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white mb-1">Qu'est-ce que Spin & Win ?</h2>
            <p className="text-gray-400 text-sm max-w-3xl">
              Ajoutez un jeu de roue à votre programme de fidélité. Les clients tournent après chaque tampon ou une fois par jour pour gagner des coupons, des points bonus, des tampons ou des cadeaux — pour les fidéliser et les faire revenir.
            </p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 hover:border-[#374151] transition-colors relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${game.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="font-medium text-white">{game.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${game.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {game.status}
                  </span>
                </div>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer ${game.status === 'Active' ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">{game.segments.length} segments</p>
              
              <div className="flex items-center gap-6 mb-6">
                <PieChart segments={game.segments} size={80} />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Lots à gagner</p>
                  <div className="space-y-2">
                    {game.segments.map((seg, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          {seg.label === 'Pas de prix' ? <X size={12} className="text-gray-500" /> : <Gift size={12} className="text-pink-400" />}
                          <span className="text-gray-300">{seg.label}</span>
                        </div>
                        <span className="text-gray-500">{seg.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 border-t border-[#1F2937] pt-4">
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                  <Edit2 size={14} /> Modifier
                </button>
                <button className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL VIEW (STEPS 1-3) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1F2937] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Nouveau jeu roue</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#3B82F6] font-medium uppercase text-xs tracking-wider">
                    Étape {step} sur 3
                  </span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar & Tabs */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1 bg-[#1F2937] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3B82F6] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-[#3B82F6]' : 'text-gray-500'}`}>
                  {step > 1 ? <CheckCircle2 size={16} /> : <div className="w-5 h-5 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs">1</div>}
                  Paramètres
                </div>
                <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-[#3B82F6]' : 'text-gray-500'}`}>
                   {step > 2 ? <CheckCircle2 size={16} /> : <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#3B82F6] text-white' : 'bg-[#1F2937] text-gray-400'}`}>2</div>}
                  Récompenses
                </div>
                <div className={`flex items-center gap-2 text-sm ${step >= 3 ? 'text-[#3B82F6]' : 'text-gray-500'}`}>
                   <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#3B82F6] text-white' : 'bg-[#1F2937] text-gray-400'}`}>3</div>
                  Conditions
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* STEP 1: SETTINGS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-[#1F2937]/50 border border-[#374151] rounded-xl p-5">
                    <h3 className="flex items-center gap-2 text-white font-medium mb-4">
                      <Settings size={18} className="text-gray-400" /> Informations
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Nom et période de votre campagne</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nom du jeu <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={gameConfig.name}
                          onChange={(e) => setGameConfig({...gameConfig, name: e.target.value})}
                          placeholder="ex. Défi d'été"
                          className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                          <Calendar size={14} /> Planification <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Facultatif</span>
                        </label>
                        <div className="flex gap-4">
                          <input type="date" className="w-1/2 bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-gray-300 text-sm" />
                          <input type="date" className="w-1/2 bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-gray-300 text-sm" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Laissez vide pour lancer immédiatement et sans fin</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1F2937]/50 border border-[#374151] rounded-xl p-5">
                    <h3 className="flex items-center gap-2 text-white font-medium mb-1">
                      <RefreshCw size={18} className="text-gray-400" /> Règles du jeu
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Quand et à quelle fréquence les clients peuvent jouer</p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Quand peut-on tourner ?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['purchase', 'daily', 'custom'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setGameConfig({...gameConfig, rule: type as any})}
                            className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                              gameConfig.rule === type 
                                ? 'bg-[#3B82F6] border-[#3B82F6] text-white' 
                                : 'bg-[#111827] border-[#374151] text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            {type === 'purchase' && 'Après chaque achat'}
                            {type === 'daily' && 'Une fois par jour'}
                            {type === 'custom' && 'Personnalisé (X/jour)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#374151] mt-4">
                      <div>
                        <p className="text-sm font-medium text-white">Premier tour gratuit</p>
                        <p className="text-xs text-gray-500">Permettre aux clients de tourner une fois avant leur premier tampon</p>
                      </div>
                      <div 
                        onClick={() => setGameConfig({...gameConfig, firstFree: !gameConfig.firstFree})}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${gameConfig.firstFree ? 'bg-[#3B82F6]' : 'bg-[#374151]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.firstFree ? 'left-6' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: REWARDS */}
              {step === 2 && (
                <div className="flex gap-8">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-4 bg-[#1F2937]/50 border border-[#374151] p-3 rounded-xl">
                      <span className="text-sm text-gray-300"><strong className="text-white">{gameConfig.segments.length}</strong>/12 cases</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">Total <strong className="text-green-400">{gameConfig.segments.reduce((a,b)=>a+b.probability, 0).toFixed(1)}%</strong></span>
                        <button onClick={addSegment} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Plus size={16} /> Ajouter
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {gameConfig.segments.map((seg, idx) => (
                        <div key={seg.id} className="flex items-center gap-3 bg-[#1F2937]/50 border border-[#374151] rounded-xl p-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: seg.color }}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{seg.label}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Gift size={12}/> {seg.probability}%</p>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400">
                             <Edit2 size={16} className="cursor-pointer hover:text-white" />
                             <Trash2 size={16} className="cursor-pointer hover:text-red-400" onClick={() => removeSegment(seg.id)} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Info size={14} /> Comment fonctionnent la probabilité et le stock ?
                    </div>
                  </div>

                  {/* Wheel Preview */}
                  <div className="w-64 flex flex-col items-center">
                    <div className="w-full bg-[#1F2937]/30 border border-[#374151] rounded-xl p-6 flex flex-col items-center">
                      <PieChart segments={gameConfig.segments} size={180} />
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {gameConfig.segments.map((seg, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-gray-400">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}/>
                            {seg.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Aperçu de la roue</p>
                  </div>
                </div>
              )}

              {/* STEP 3: CONDITIONS */}
              {step === 3 && (
                <div className="bg-[#1F2937]/50 border border-[#374151] rounded-xl p-5">
                  <h3 className="flex items-center gap-2 text-white font-medium mb-1">
                    <CheckCircle2 size={18} className="text-gray-400" /> Conditions requises
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">Exiger que les clients complètent ces actions avant de tourner</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Condition 1 */}
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#374151] p-4 rounded-xl">
                      <div className="bg-[#1F2937] p-2 rounded-lg text-blue-400">
                        <Smartphone size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-white font-medium text-sm">Installer l'application</h4>
                          <div 
                            onClick={() => setGameConfig({...gameConfig, conditions: {...gameConfig.conditions, installApp: !gameConfig.conditions.installApp}})}
                            className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${gameConfig.conditions.installApp ? 'bg-[#3B82F6]' : 'bg-gray-600'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.conditions.installApp ? 'left-4.5' : 'left-0.5'}`}></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Le client doit ajouter l'application à son écran d'accueil</p>
                      </div>
                    </div>

                    {/* Condition 2 */}
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#374151] p-4 rounded-xl">
                      <div className="bg-[#1F2937] p-2 rounded-lg text-blue-400">
                        <Bell size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-white font-medium text-sm">Activer les notifications</h4>
                          <div 
                            onClick={() => setGameConfig({...gameConfig, conditions: {...gameConfig.conditions, notifications: !gameConfig.conditions.notifications}})}
                            className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${gameConfig.conditions.notifications ? 'bg-[#3B82F6]' : 'bg-gray-600'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.conditions.notifications ? 'left-4.5' : 'left-0.5'}`}></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Le client doit activer les notifications push</p>
                      </div>
                    </div>

                    {/* Condition 3 */}
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#3B82F6] p-4 rounded-xl col-span-2">
                      <div className="bg-[#1F2937] p-2 rounded-lg text-blue-400">
                        <PhoneCall size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-white font-medium text-sm">Lier le téléphone</h4>
                          <div 
                            onClick={() => setGameConfig({...gameConfig, conditions: {...gameConfig.conditions, phone: !gameConfig.conditions.phone}})}
                            className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${gameConfig.conditions.phone ? 'bg-[#3B82F6]' : 'bg-gray-600'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${gameConfig.conditions.phone ? 'left-4.5' : 'left-0.5'}`}></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">Le client doit lier son numéro de téléphone et accepter le marketing SMS</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#1F2937] flex justify-between items-center bg-[#111827]">
              <button 
                onClick={() => step > 1 ? setStep(step - 1) : setIsModalOpen(false)}
                className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium px-4 py-2"
              >
                {step === 1 ? 'Annuler' : '< Retour'}
              </button>
              
              {step < 3 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
                >
                  Continuer <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleCreateGame}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-medium"
                >
                  Créer le jeu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}