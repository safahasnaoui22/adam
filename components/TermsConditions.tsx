// components/TermsConditions.tsx
"use client";

interface TermsConditionsProps {
  terms: string;
  howToUse: string;
  onTermsChange: (terms: string) => void;
  onHowToUseChange: (howToUse: string) => void;
}

export default function TermsConditions({
  terms,
  howToUse,
  onTermsChange,
  onHowToUseChange,
}: TermsConditionsProps) {
  return (
    <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-2xl shadow-2xl border border-[#1e3a5f]/40 p-6 md:p-8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#1e3a5f]/60">
        <div className="p-2 bg-[#fe5502]/10 rounded-lg">
          <svg className="w-6 h-6 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Conditions & informations</h2>
          <p className="text-sm text-gray-400">Informations légales et règlement du programme</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conditions générales */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <h3 className="text-lg font-medium text-white">Conditions générales</h3>
          </div>
          <textarea
            rows={12}
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition font-mono"
            placeholder="Règles du programme de fidélité, validité des points, conditions d'utilisation..."
          />
          <p className="text-xs text-gray-500 italic">Ces conditions seront affichées sur la carte client.</p>
        </div>

        {/* Comment utiliser */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📘</span>
            <h3 className="text-lg font-medium text-white">Comment utiliser</h3>
          </div>
          <textarea
            rows={12}
            value={howToUse}
            onChange={(e) => onHowToUseChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a1628] border border-[#1e3a5f] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition font-mono"
            placeholder="Explications pour les clients : comment gagner des points, échanger des récompenses, etc."
          />
          <p className="text-xs text-gray-500 italic">Ces instructions aideront vos clients à utiliser le programme.</p>
        </div>
      </div>
    </div>
  );
}