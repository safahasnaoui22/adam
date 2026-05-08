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
    <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] shadow-2xl rounded-2xl p-8 border border-blue-900 space-y-8">
      
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white tracking-wide">
        Brand & Identity
      </h2>

      {/* App Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Nom de l'application *
        </label>

        <div className="flex items-center">
          <input
            type="text"
            maxLength={12}
            value={appName}
            onChange={(e) => onAppNameChange(e.target.value)}
            className="
              flex-1
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

          <span className="ml-3 text-sm text-gray-300 font-medium">
            {appName.length}/12
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-300 leading-relaxed">
          Ce nom apparaît sous l'icône de l'application sur l'écran d'accueil
          des clients.
        </p>
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          URL de la carte *
        </label>

        <div className="flex items-center">
          <input
            type="text"
            value={urlSlug}
            onChange={(e) =>
              onUrlSlugChange(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
              )
            }
            className="
              flex-1
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
            .adam.tn
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-300 leading-relaxed">
          Cette URL permet à vos clients d'accéder à votre carte de fidélité
          depuis leur navigateur.
        </p>

        <p className="mt-4 text-sm font-medium text-blue-300 bg-[#132B4F] px-4 py-3 rounded-xl border border-blue-700">
          https://{urlSlug || "..."} .adam.tn
        </p>
      </div>
    </div>
  );
}