"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, RotateCw } from "lucide-react";

type Segment = { label: string; points: number; color: string; textColor: string };

const PRESET_COLORS = ["#fe5502", "#382f45", "#ff8c42", "#4f3f60", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"];

export default function SpinWheelConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [dailyFreeSpins, setDailyFreeSpins] = useState(3);
  const [bonusSpinsPerVisit, setBonusSpinsPerVisit] = useState(1);
  const [segments, setSegments] = useState<Segment[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/spin-config");
      const data = await res.json();
      if (res.ok) {
        setIsActive(data.isActive);
        setDailyFreeSpins(data.dailyFreeSpins);
        setBonusSpinsPerVisit(data.bonusSpinsPerVisit);
        setSegments(data.segments);
      } else {
        toast.error(data.error || "Échec du chargement");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 220, cx = size / 2, cy = size / 2, R = 104;
    const ARC = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, size, size);
    segments.forEach((seg, i) => {
      const start = i * ARC - Math.PI / 2;
      const end = start + ARC;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + ARC / 2);
      ctx.textAlign = "right";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.fillStyle = seg.textColor;
      ctx.fillText(seg.label, R - 10, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = "#0d1f3c";
    ctx.fill();
    ctx.strokeStyle = "#fe550260";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [segments]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const updateSegment = (index: number, patch: Partial<Segment>) => {
    setSegments((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSegment = () => {
    if (segments.length >= 12) {
      toast.error("Maximum 12 segments");
      return;
    }
    const color = PRESET_COLORS[segments.length % PRESET_COLORS.length];
    setSegments((prev) => [...prev, { label: "10 pts", points: 10, color, textColor: "#ffffff" }]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) {
      toast.error("La roue doit avoir au moins 2 segments");
      return;
    }
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/spin-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive, dailyFreeSpins, bonusSpinsPerVisit, segments }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Roue mise à jour");
      } else {
        toast.error(data.error || "Échec de l'enregistrement");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe5502]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <RotateCw className="text-[#fe5502]" size={28} />
          Roue de la Chance
        </h1>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <span className="text-sm text-gray-400">{isActive ? "Activée" : "Désactivée"}</span>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-[#fe5502]" : "bg-[#4f3f60]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : ""}`} />
          </button>
        </label>
      </div>
      <p className="text-gray-400 mb-8">
        Configurez les segments, les tours gratuits quotidiens et les tours bonus gagnés par achat.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Preview + spin rules ── */}
        <div className="space-y-6">
          <div className="bg-[#0d1f3c] rounded-xl shadow p-6 border border-[#1e3a5f] flex flex-col items-center">
            <canvas ref={canvasRef} width={220} height={220} className="rounded-full" />
            <p className="text-xs text-gray-500 mt-3 text-center">Aperçu — les clients verront cette roue</p>
          </div>

          <div className="bg-[#0d1f3c] rounded-xl shadow p-6 border border-[#1e3a5f] space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tours gratuits par jour
              </label>
              <input
                type="number"
                min={0}
                value={dailyFreeSpins}
                onChange={(e) => setDailyFreeSpins(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#152a4a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#fe5502]"
              />
              <p className="text-xs text-gray-500 mt-1">Se réinitialise chaque jour, pour chaque client.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tours bonus par achat
              </label>
              <input
                type="number"
                min={0}
                value={bonusSpinsPerVisit}
                onChange={(e) => setBonusSpinsPerVisit(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#152a4a] border border-[#1e3a5f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#fe5502]"
              />
              <p className="text-xs text-gray-500 mt-1">Accordés à chaque passage/scan, cumulables.</p>
            </div>
          </div>
        </div>

        {/* ── Segments editor ── */}
        <div className="bg-[#0d1f3c] rounded-xl shadow p-6 border border-[#1e3a5f]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Segments de la roue</h2>
            <button
              onClick={addSegment}
              className="flex items-center gap-1.5 text-sm font-medium text-[#fe5502] hover:text-[#ff7a33] transition-colors"
            >
              <Plus size={16} /> Ajouter un segment
            </button>
          </div>

          <div className="space-y-2">
            {segments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-[#152a4a] border border-[#1e3a5f] rounded-lg p-3"
              >
                <GripVertical size={16} className="text-gray-600 shrink-0" />

                <input
                  type="color"
                  value={seg.color}
                  onChange={(e) => updateSegment(i, { color: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-[#1e3a5f] bg-transparent cursor-pointer shrink-0"
                  title="Couleur du segment"
                />

                <input
                  type="text"
                  value={seg.label}
                  onChange={(e) => updateSegment(i, { label: e.target.value })}
                  placeholder="Libellé (ex: 25 pts)"
                  className="flex-1 min-w-0 bg-[#0d1f3c] border border-[#1e3a5f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#fe5502]"
                />

                <input
                  type="number"
                  min={0}
                  value={seg.points}
                  onChange={(e) => updateSegment(i, { points: Math.max(0, parseInt(e.target.value) || 0) })}
                  placeholder="Points"
                  className="w-24 bg-[#0d1f3c] border border-[#1e3a5f] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#fe5502]"
                />

                <button
                  onClick={() => removeSegment(i)}
                  className="text-gray-500 hover:text-red-400 transition-colors shrink-0 p-1.5"
                  title="Supprimer ce segment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Astuce : mettez <span className="text-gray-400">0 point</span> sur un ou deux segments
            (« Réessayer ») pour garder la roue équilibrée — sinon chaque tour gagne à coup sûr.
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#fe5502] hover:bg-[#ff7a33] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}