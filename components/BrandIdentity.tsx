"use client";

interface BrandIdentityProps {
  appName: string;
  urlSlug: string;
  onAppNameChange: (name: string) => void;
  onUrlSlugChange: (slug: string) => void;
}

export default function BrandIdentity({
  appName,
  urlSlug,
  onAppNameChange,
  onUrlSlugChange,
}: BrandIdentityProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold">Brand & Identity</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'application *
        </label>
        <div className="flex items-center">
          <input
            type="text"
            maxLength={12}
            value={appName}
            onChange={(e) => onAppNameChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="ml-2 text-sm text-gray-500">
            {appName.length}/12
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Ce nom apparaît sous l'icône de l'application sur l'écran d'accueil des clients.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de la carte *
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={urlSlug}
            onChange={(e) => onUrlSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="ml-2 text-gray-500">.stampi.tn</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Cette URL permet à vos clients d'accéder à votre carte de fidélité depuis leur navigateur.
        </p>
        <p className="mt-2 text-sm text-indigo-600">
          https://{urlSlug || "..."}.adam.tn
        </p>
      </div>
    </div>
  );
}