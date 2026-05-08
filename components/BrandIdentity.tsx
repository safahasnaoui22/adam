// components/BrandIdentity.tsx
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
    <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-2xl shadow-2xl border border-[#1e3a5f]/40 p-6 md:p-8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#1e3a5f]/60">
        <div className="p-2 bg-[#fe5502]/10 rounded-lg">
          <svg className="w-6 h-6 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Brand & Identity</h2>
          <p className="text-sm text-gray-400">Personnalisez l'apparence de votre marque sur l'application client</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'application */}
        <div className="bg-[#0a1628] rounded-xl p-5 border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📱</span>
            <h3 className="text-lg font-medium text-white">Nom de l'application</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={12}
              value={appName}
              onChange={(e) => onAppNameChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition"
            />
            <span className="text-sm text-gray-400 min-w-[45px]">{appName.length}/12</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Ce nom apparaît sous l'icône de l'application sur l'écran d'accueil des clients.
          </p>
        </div>

        {/* URL de la carte */}
        <div className="bg-[#0a1628] rounded-xl p-5 border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔗</span>
            <h3 className="text-lg font-medium text-white">URL de la carte</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlSlug}
              onChange={(e) => onUrlSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
              className="flex-1 px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition"
            />
            <span className="text-gray-400 whitespace-nowrap">.adam.tn</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Cette URL permet à vos clients d'accéder à votre carte de fidélité depuis leur navigateur.
          </p>
          <div className="mt-3 pt-2 border-t border-[#1e3a5f]/50">
            <p className="text-sm text-[#fe5502] font-mono break-all">
              https://{urlSlug || "votre-identifiant"}.adam.tn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}