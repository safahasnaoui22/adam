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
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Conditions générales</h2>
        <textarea
          rows={15}
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          placeholder="Conditions générales – Programme de fidélité..."
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Comment utiliser</h2>
        <textarea
          rows={10}
          value={howToUse}
          onChange={(e) => onHowToUseChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          placeholder="Comment utiliser – Pour les clients..."
        />
      </div>
    </div>
  );
}