// components/SocialMedia.tsx
"use client";

import { useState } from "react";

interface SocialMediaProps {
  value: any;
  onChange: (social: any) => void;
}

export default function SocialMedia({ value, onChange }: SocialMediaProps) {
  const [social, setSocial] = useState(value || {});

  const updateField = (platform: string, val: string) => {
    // Remove any accidental leading '@'
    const cleanVal = val.replace(/^@/, '');
    const newSocial = { ...social, [platform]: cleanVal };
    setSocial(newSocial);
    onChange(newSocial);
  };

  const platforms = [
    { id: "facebook", name: "Facebook", icon: "📘", placeholder: "votre_page", gradient: "from-blue-600/20 to-blue-800/20" },
    { id: "instagram", name: "Instagram", icon: "📸", placeholder: "votre_compte", gradient: "from-pink-600/20 to-purple-800/20" },
    { id: "twitter", name: "Twitter / X", icon: "🐦", placeholder: "votre_handle", gradient: "from-gray-600/20 to-gray-800/20" },
    { id: "tiktok", name: "TikTok", icon: "🎵", placeholder: "votre_username", gradient: "from-purple-600/20 to-pink-800/20" },
  ];

  return (
    <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-2xl shadow-2xl border border-[#1e3a5f]/40 p-6 md:p-8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#1e3a5f]/60">
        <div className="p-2 bg-[#fe5502]/10 rounded-lg">
          <svg className="w-6 h-6 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.5l-9-5.25L3 7.5m9 5.25L21 7.5M12 21v-8.25M21 7.5v9m-18-9v9m18 0l-9 5.25-9-5.25" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Réseaux sociaux</h2>
          <p className="text-sm text-gray-400">Ajoutez vos profils sociaux pour que les clients puissent vous suivre</p>
        </div>
      </div>

      {/* Grid of social cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`bg-gradient-to-r ${platform.gradient} rounded-xl border border-[#1e3a5f] p-5 transition-all duration-200 hover:border-[#fe5502]/30 hover:shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{platform.icon}</span>
              <h3 className="text-lg font-medium text-white">{platform.name}</h3>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono text-sm">
                @
              </div>
              <input
                type="text"
                value={social[platform.id] || ""}
                onChange={(e) => updateField(platform.id, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full pl-8 pr-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] transition-all duration-200"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ex: {platform.placeholder}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}