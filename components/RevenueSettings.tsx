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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Suivi des revenus</h2>
      <p className="text-sm text-gray-600 mb-6">
        Entrez les hypothèses utilisées pour estimer l'augmentation des revenus grâce aux coupons et cartes de fidélité.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dépense moyenne par visite
          </label>
          <div className="flex items-center">
            <input
              type="number"
              step="0.01"
              min="0"
              value={value.avgSpend}
              onChange={(e) => updateField("avgSpend", parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="ml-2 text-gray-500">DT</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Montant moyen dépensé par client à chaque visite. Utilisé pour estimer le chiffre d'affaires généré par le programme.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visites de base par mois
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="50"
              value={value.baseVisits}
              onChange={(e) => updateField("baseVisits", parseInt(e.target.value) || 1)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="ml-2 text-gray-500">visites/mois</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Nombre moyen de visites par mois avant le programme. Sert de référence pour mesurer l'augmentation de fréquentation.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client considéré inactif après combien de jours sans visite ?
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="7"
              max="365"
              value={value.inactiveDays}
              onChange={(e) => updateField("inactiveDays", parseInt(e.target.value) || 90)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="ml-2 text-gray-500">jours</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Nombre de jours sans visite après lesquels un client est considéré comme inactif. Utilisé pour identifier les clients à réactiver.
          </p>
        </div>
      </div>
    </div>
  );
}