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
    <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] shadow-2xl rounded-2xl p-8 space-y-8 border border-blue-900">
      
      {/* Conditions générales */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4 tracking-wide">
          Conditions générales
        </h2>

        <textarea
          rows={15}
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          placeholder="Conditions générales – Programme de fidélité..."
          className="
            w-full
            px-4
            py-3
            rounded-xl
            bg-[#132B4F]
            border
            border-blue-700
            text-white
            placeholder:text-gray-300
            font-mono
            text-sm
            resize-none
            outline-none
            focus:ring-2
            focus:ring-blue-400
            focus:border-blue-400
            transition-all
            duration-300
            shadow-inner
          "
        />
      </div>

      {/* Comment utiliser */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4 tracking-wide">
          Comment utiliser
        </h2>

        <textarea
          rows={10}
          value={howToUse}
          onChange={(e) => onHowToUseChange(e.target.value)}
          placeholder="Comment utiliser – Pour les clients..."
          className="
            w-full
            px-4
            py-3
            rounded-xl
            bg-[#132B4F]
            border
            border-blue-700
            text-white
            placeholder:text-gray-300
            font-mono
            text-sm
            resize-none
            outline-none
            focus:ring-2
            focus:ring-blue-400
            focus:border-blue-400
            transition-all
            duration-300
            shadow-inner
          "
        />
      </div>
    </div>
  );
}