"use client";

interface RevenueSettingsProps {
  value: {
    avgSpend: number;
    baseVisits: number;
    inactiveDays: number;
  };
  onChange: (settings: any) => void;
}

export default function RevenueSettings({
  value,
  onChange,
}: RevenueSettingsProps) {
  const updateField = (field: string, val: number) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] shadow-2xl rounded-2xl p-8 border border-blue-900">
      
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white mb-3 tracking-wide">
        Suivi des revenus
      </h2>

      <p className="text-sm text-gray-300 mb-8 leading-relaxed">
        Entrez les hypothèses utilisées pour estimer l'augmentation des
        revenus grâce aux coupons et cartes de fidélité.
      </p>

      <div className="space-y-8">
        
        {/* Dépense moyenne */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Dépense moyenne par visite
          </label>

          <div className="flex items-center">
            <input
              type="number"
              step="0.01"
              min="0"
              value={value.avgSpend}
              onChange={(e) =>
                updateField(
                  "avgSpend",
                  parseFloat(e.target.value) || 0
                )
              }
              className="
                w-40
                px-4
                py-3
                rounded-xl
                bg-[#132B4F]
                border
                border-blue-700
                text-white
                placeholder:text-gray-300
                text-sm
                outline-none
                focus:ring-2
                focus:ring-blue-400
                focus:border-blue-400
                transition-all
                duration-300
                shadow-inner
              "
            />

            <span className="ml-3 text-gray-300 font-medium">
              DT
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            Montant moyen dépensé par client à chaque visite. Utilisé pour
            estimer le chiffre d'affaires généré par le programme.
          </p>
        </div>

        {/* Visites de base */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Visites de base par mois
          </label>

          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="50"
              value={value.baseVisits}
              onChange={(e) =>
                updateField(
                  "baseVisits",
                  parseInt(e.target.value) || 1
                )
              }
              className="
                w-40
                px-4
                py-3
                rounded-xl
                bg-[#132B4F]
                border
                border-blue-700
                text-white
                text-sm
                outline-none
                focus:ring-2
                focus:ring-blue-400
                focus:border-blue-400
                transition-all
                duration-300
                shadow-inner
              "
            />

            <span className="ml-3 text-gray-300 font-medium">
              visites/mois
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            Nombre moyen de visites par mois avant le programme. Sert de
            référence pour mesurer l'augmentation de fréquentation.
          </p>
        </div>

        {/* Client inactif */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Client considéré inactif après combien de jours sans visite ?
          </label>

          <div className="flex items-center">
            <input
              type="number"
              min="7"
              max="365"
              value={value.inactiveDays}
              onChange={(e) =>
                updateField(
                  "inactiveDays",
                  parseInt(e.target.value) || 90
                )
              }
              className="
                w-40
                px-4
                py-3
                rounded-xl
                bg-[#132B4F]
                border
                border-blue-700
                text-white
                text-sm
                outline-none
                focus:ring-2
                focus:ring-blue-400
                focus:border-blue-400
                transition-all
                duration-300
                shadow-inner
              "
            />

            <span className="ml-3 text-gray-300 font-medium">
              jours
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            Nombre de jours sans visite après lesquels un client est considéré
            comme inactif. Utilisé pour identifier les clients à réactiver.
          </p>
        </div>
      </div>
    </div>
  );
}