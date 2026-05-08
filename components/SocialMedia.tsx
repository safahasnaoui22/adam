"use client";

import { useState } from "react";

interface SocialMediaProps {
  value: any;
  onChange: (social: any) => void;
}

export default function SocialMedia({ value, onChange }: SocialMediaProps) {
  const [social, setSocial] = useState(value || {});

  const updateField = (platform: string, val: string) => {
    const newSocial = { ...social, [platform]: val };
    setSocial(newSocial);
    onChange(newSocial);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Réseaux sociaux</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facebook
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">@</span>
            <input
              type="text"
              value={social.facebook || ""}
              onChange={(e) => updateField("facebook", e.target.value)}
              placeholder="username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">@</span>
            <input
              type="text"
              value={social.instagram || ""}
              onChange={(e) => updateField("instagram", e.target.value)}
              placeholder="username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Twitter/X
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">@</span>
            <input
              type="text"
              value={social.twitter || ""}
              onChange={(e) => updateField("twitter", e.target.value)}
              placeholder="handle"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TikTok
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">@</span>
            <input
              type="text"
              value={social.tiktok || ""}
              onChange={(e) => updateField("tiktok", e.target.value)}
              placeholder="username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}