// components/OpeningHours.tsx
"use client";

import { useState } from "react";

const days = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
];

interface OpeningHoursProps {
  value: any;
  onChange: (hours: any) => void;
}

export default function OpeningHours({ value, onChange }: OpeningHoursProps) {
  const [hours, setHours] = useState(value || {});

  const updateDay = (day: string, field: string, val: any) => {
    const newHours = { ...hours };
    if (!newHours[day]) {
      newHours[day] = { open: "09:00", close: "18:00", closed: false };
    }
    
    if (field === "closed") {
      newHours[day].closed = val;
    } else if (field === "open") {
      newHours[day].open = val;
    } else if (field === "close") {
      newHours[day].close = val;
    }
    
    setHours(newHours);
    onChange(newHours);
  };

  return (
    <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-2xl shadow-2xl border border-[#1e3a5f]/40 p-6 md:p-8 transition-all duration-300">
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#1e3a5f]/60">
        <div className="p-2 bg-[#fe5502]/10 rounded-lg">
          <svg className="w-6 h-6 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Horaires d'ouverture</h2>
          <p className="text-sm text-gray-400">Définissez les jours et heures d'ouverture de votre commerce</p>
        </div>
      </div>

      {/* Desktop view: grid */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-400 pb-3 mb-2 border-b border-[#1e3a5f]/50">
            <div className="col-span-3">Jour</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-3">Ouvre à</div>
            <div className="col-span-3">Ferme à</div>
            <div className="col-span-1"></div>
          </div>
          {days.map((day) => {
            const dayData = hours[day] || { open: "09:00", close: "18:00", closed: false };
            return (
              <div key={day} className="grid grid-cols-12 gap-3 items-center py-3 border-b border-[#1e3a5f]/30 hover:bg-[#1e3a5f]/10 transition-colors rounded-lg">
                <div className="col-span-3 flex items-center gap-2 text-white">
                  <span className="text-lg">{day === "Samedi" ? "🎉" : day === "Dimanche" ? "☀️" : "🌙"}</span>
                  <span className="font-medium">{day}</span>
                </div>
                <div className="col-span-2">
                  <select
                    value={dayData.closed ? "Fermé" : "Ouvert"}
                    onChange={(e) => updateDay(day, "closed", e.target.value === "Fermé")}
                    className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition"
                  >
                    <option value="Ouvert">Ouvert</option>
                    <option value="Fermé">Fermé</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="time"
                    value={dayData.open}
                    onChange={(e) => updateDay(day, "open", e.target.value)}
                    disabled={dayData.closed}
                    className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="time"
                    value={dayData.close}
                    onChange={(e) => updateDay(day, "close", e.target.value)}
                    disabled={dayData.closed}
                    className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                <div className="col-span-1 text-center">
                  {dayData.closed && <span className="text-xs text-gray-500">🔒</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile view: cards */}
      <div className="md:hidden space-y-4">
        {days.map((day) => {
          const dayData = hours[day] || { open: "09:00", close: "18:00", closed: false };
          return (
            <div key={day} className="bg-[#0a1628] rounded-xl border border-[#1e3a5f] p-4 space-y-3 hover:border-[#fe5502]/30 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{day === "Samedi" ? "🎉" : day === "Dimanche" ? "☀️" : "🌙"}</span>
                  <span className="text-white font-medium">{day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Statut</span>
                  <select
                    value={dayData.closed ? "Fermé" : "Ouvert"}
                    onChange={(e) => updateDay(day, "closed", e.target.value === "Fermé")}
                    className="px-3 py-1.5 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:ring-2 focus:ring-[#fe5502]/50"
                  >
                    <option value="Ouvert">Ouvert</option>
                    <option value="Fermé">Fermé</option>
                  </select>
                </div>
              </div>
              {!dayData.closed && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Ouvre à</label>
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => updateDay(day, "open", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:ring-2 focus:ring-[#fe5502]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Ferme à</label>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => updateDay(day, "close", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:ring-2 focus:ring-[#fe5502]/50"
                    />
                  </div>
                </div>
              )}
              {dayData.closed && (
                <div className="text-center py-2 text-gray-500 text-sm border-t border-[#1e3a5f] pt-2">
                  Fermé toute la journée
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}