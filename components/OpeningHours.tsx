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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Horaires d'ouverture</h2>
      
      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-3">Jour</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-3">Ouvre à</div>
          <div className="col-span-3">Ferme à</div>
        </div>

        {/* Days */}
        {days.map((day) => (
          <div key={day} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 font-medium">{day}</div>
            
            <div className="col-span-2">
              <select
                value={hours[day]?.closed ? "Fermé" : "Ouvert"}
                onChange={(e) => updateDay(day, "closed", e.target.value === "Fermé")}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="Ouvert">Ouvert</option>
                <option value="Fermé">Fermé</option>
              </select>
            </div>

            <div className="col-span-3">
              <input
                type="time"
                value={hours[day]?.open || "09:00"}
                onChange={(e) => updateDay(day, "open", e.target.value)}
                disabled={hours[day]?.closed}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div className="col-span-3">
              <input
                type="time"
                value={hours[day]?.close || "18:00"}
                onChange={(e) => updateDay(day, "close", e.target.value)}
                disabled={hours[day]?.closed}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {hours[day]?.closed && (
              <div className="col-span-1 text-gray-400">—</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}