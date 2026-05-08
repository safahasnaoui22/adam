// components/RevenueSettings.tsx
"use client";

interface RevenueSettingsProps {
  value: {
    avgSpend: number;
    baseVisits: number;
    inactiveDays: number;
  };
  onChange: (settings: any) => void;
}

export default function RevenueSettings({ value, onChange }: RevenueSettingsProps) {
  const updateField = (field: string, val: number) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-2xl shadow-2xl border border-[#1e3a5f]/40 p-6 md:p-8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#1e3a5f]/60">
        <div className="p-2 bg-[#fe5502]/10 rounded-lg">
          <svg className="w-6 h-6 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Suivi des revenus</h2>
          <p className="text-sm text-gray-400">
            Entrez les hypothèses utilisées pour estimer l'augmentation des revenus grâce aux coupons et cartes de fidélité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dépense moyenne par visite */}
        <div className="bg-[#0a1628] rounded-xl p-5 border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💰</span>
            <h3 className="text-lg font-medium text-white">Dépense moyenne par visite</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={value.avgSpend}
              onChange={(e) => updateField("avgSpend", parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition"
            />
            <span className="text-gray-400">DT</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Montant moyen dépensé par client à chaque visite. Utilisé pour estimer le chiffre d'affaires généré par le programme.
          </p>
        </div>

        {/* Visites de base par mois */}
        <div className="bg-[#0a1628] rounded-xl p-5 border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📅</span>
            <h3 className="text-lg font-medium text-white">Visites de base par mois</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="50"
              value={value.baseVisits}
              onChange={(e) => updateField("baseVisits", parseInt(e.target.value) || 1)}
              className="w-32 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition"
            />
            <span className="text-gray-400">visites/mois</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Nombre moyen de visites par mois avant le programme. Sert de référence pour mesurer l'augmentation de fréquentation.
          </p>
        </div>

        {/* Client inactif après X jours */}
        <div className="bg-[#0a1628] rounded-xl p-5 border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⏳</span>
            <h3 className="text-lg font-medium text-white">Client considéré inactif après</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="7"
              max="365"
              value={value.inactiveDays}
              onChange={(e) => updateField("inactiveDays", parseInt(e.target.value) || 90)}
              className="w-32 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition"
            />
            <span className="text-gray-400">jours sans visite</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Nombre de jours sans visite après lesquels un client est considéré comme inactif. Utilisé pour identifier les clients à réactiver.
          </p>
        </div>
      </div>
    </div>
  );
}