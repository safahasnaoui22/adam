"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import OpeningHours from "@/components/OpeningHours";
import SocialMedia from "@/components/SocialMedia";
import TermsConditions from "@/components/TermsConditions";
import RevenueSettings from "@/components/RevenueSettings";
import BrandIdentity from "@/components/BrandIdentity";
import ThemeSelector from "@/components/ThemeSelector";

export default function PersonalizePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  const [restaurant, setRestaurant] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null as string | null,
    address: "",
    phoneNumber: "",
    email: "",
    website: "",
    googleMapsUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    googleMapsBonusStars: 50,
    facebookBonusStars: 50,
    instagramBonusStars: 50,
    twitterBonusStars: 50,
    googleMapsCode: "",
    openingHours: {},
    socialMedia: {},
    termsConditions: "",
    howToUse: "",
    revenueSettings: {
      avgSpend: 0,
      baseVisits: 1,
      inactiveDays: 90,
    },
    appName: "",
    urlSlug: "",
    theme: {},
    backgroundPattern: "",
  });

  const generateGoogleCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, googleMapsCode: code });
  };

  // Load existing restaurant data
  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurant/profile");
      const data = await res.json();
      
      if (res.ok) {
        setRestaurant(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          logo: data.logo || null,
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          website: data.website || "",
          googleMapsUrl: data.googleMapsUrl || "",
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          twitterUrl: data.twitterUrl || "",
          googleMapsBonusStars: data.googleMapsBonusStars || 50,
          facebookBonusStars: data.facebookBonusStars || 50,
          instagramBonusStars: data.instagramBonusStars || 50,
          twitterBonusStars: data.twitterBonusStars || 50,
          googleMapsCode: data.googleMapsCode || "",
          openingHours: data.openingHours || {},
          socialMedia: data.socialMedia || {},
          termsConditions: data.termsConditions || "",
          howToUse: data.howToUse || "",
          revenueSettings: data.revenueSettings || {
            avgSpend: 0,
            baseVisits: 1,
            inactiveDays: 90,
          },
          appName: data.appName || data.name?.substring(0, 12) || "",
          urlSlug: data.urlSlug || "",
          theme: data.theme || {},
          backgroundPattern: data.backgroundPattern || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/restaurant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Paramètres enregistrés avec succès !");
        await fetchRestaurant();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4"></div>
          <p className="text-gray-400">Chargement de vos paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">Personnalisez votre carte</h1>
      <p className="text-gray-400 mb-8">
        Rendez votre carte de fidélité unique. Ces paramètres aident les clients à reconnaître votre commerce.
      </p>

      {/* Modern Tabs */}
      <div className="relative mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {[
            { id: "business", label: "Contact & Business", icon: "🏢" },
            { id: "hours", label: "Horaires", icon: "⏰" },
            { id: "social", label: "Réseaux sociaux", icon: "📱" },
            { id: "legal", label: "Conditions", icon: "⚖️" },
            { id: "revenue", label: "Suivi des revenus", icon: "💰" },
            { id: "brand", label: "Brand & Identity", icon: "🎨" },
            { id: "theme", label: "Thème", icon: "🎨" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                transform hover:-translate-y-0.5 hover:shadow-md
                flex items-center gap-2
                ${activeTab === tab.id
                  ? "bg-gradient-to-r from-[#fe5502] to-[#e0682e] text-white shadow-lg shadow-orange-500/30 scale-105"
                  : "bg-[#0a1628] text-gray-400 hover:text-white hover:bg-[#1e3a5f] border border-[#1e3a5f]"
                }
              `}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-white/70 rounded-full shadow-sm" />
              )}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#1e3a5f] to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Tab – Redesigned */}
        {activeTab === "business" && (
          <div className="bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] rounded-xl shadow-xl border border-[#1e3a5f]/40 p-6 md:p-8 space-y-8 transition-all duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-[#1e3a5f]/60">
              <div className="p-2 bg-[#fe5502]/10 rounded-lg">
                <svg className="w-6 h-6 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Informations du commerce</h2>
                <p className="text-sm text-gray-400">Ces informations seront affichées sur la carte de fidélité de vos clients</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>🏢</span> Nom du commerce <span className="text-[#fe5502]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white placeholder-gray-500"
                    placeholder="Ex: Café Central"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>🖼️</span> Logo du commerce
                  </label>
                  <div className="flex items-start space-x-4">
                    {formData.logo && (
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden border-2 border-[#fe5502]/30 shadow-md">
                        <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-[#1e3a5f] rounded-lg p-4 text-center hover:border-[#fe5502] transition-all duration-200 bg-[#0a1628]/50">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="logo-upload"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, logo: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer block">
                          <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-400">
                            <span className="text-[#fe5502]">Importer un logo</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>📝</span> Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Présentez votre commerce à vos clients..."
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>📍</span> Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rue, Ville, Code postal"
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>📞</span> Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+216 XX XXX XXX"
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>✉️</span> Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                    <span>🌐</span> Site web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Social & Bonuses */}
            <div className="border-t border-[#1e3a5f]/60 pt-6 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎁</span>
                <h3 className="text-lg font-semibold text-white">Bonus clients</h3>
                <span className="text-xs bg-[#fe5502]/20 text-[#fe5502] px-2 py-0.5 rounded-full">Nouveau</span>
              </div>
              <p className="text-sm text-gray-400 mb-5">
                Ajoutez vos liens et définissez le nombre d'étoiles que les clients gagnent.
              </p>

              {/* Google Maps */}
              <div className="mb-6 p-4 bg-[#0a1628] rounded-xl border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🗺️</span>
                  <label className="text-sm font-medium text-gray-300">Google Maps</label>
                </div>
                <input
                  type="url"
                  value={formData.googleMapsUrl || ""}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-4 py-2 mb-3 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white"
                />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">Code unique</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.googleMapsCode || ""}
                        readOnly
                        className="flex-1 px-3 py-1.5 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-gray-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={generateGoogleCode}
                        className="px-3 py-1.5 bg-[#fe5502] text-white rounded-md text-sm hover:bg-[#e0682e] transition"
                      >
                        Générer
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-400">⭐ Étoiles</label>
                    <input
                      type="number"
                      value={formData.googleMapsBonusStars}
                      onChange={(e) => setFormData({ ...formData, googleMapsBonusStars: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1.5 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { platform: "Facebook", url: formData.facebookUrl, setUrl: (v: string) => setFormData({ ...formData, facebookUrl: v }), stars: formData.facebookBonusStars, setStars: (v: number) => setFormData({ ...formData, facebookBonusStars: v }), icon: "📘" },
                  { platform: "Instagram", url: formData.instagramUrl, setUrl: (v: string) => setFormData({ ...formData, instagramUrl: v }), stars: formData.instagramBonusStars, setStars: (v: number) => setFormData({ ...formData, instagramBonusStars: v }), icon: "📸" },
                  { platform: "Twitter/X", url: formData.twitterUrl, setUrl: (v: string) => setFormData({ ...formData, twitterUrl: v }), stars: formData.twitterBonusStars, setStars: (v: number) => setFormData({ ...formData, twitterBonusStars: v }), icon: "🐦" },
                ].map((social) => (
                  <div key={social.platform} className="p-3 bg-[#0a1628] rounded-xl border border-[#1e3a5f] transition-all hover:border-[#fe5502]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{social.icon}</span>
                      <label className="text-sm font-medium text-gray-300">{social.platform}</label>
                    </div>
                    <input
                      type="url"
                      value={social.url}
                      onChange={(e) => social.setUrl(e.target.value)}
                      placeholder={`Lien ${social.platform}`}
                      className="w-full px-3 py-2 mb-2 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:ring-2 focus:ring-[#fe5502]/50 focus:border-[#fe5502] text-white text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-400">⭐ Étoiles</label>
                      <input
                        type="number"
                        value={social.stars}
                        onChange={(e) => social.setStars(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-[#0a1628] border border-[#1e3a5f] rounded-md text-white text-sm text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hours Tab */}
        {activeTab === "hours" && (
          <OpeningHours 
            value={formData.openingHours}
            onChange={(hours) => setFormData({ ...formData, openingHours: hours })}
          />
        )}

        {/* Social Media Tab */}
        {activeTab === "social" && (
          <SocialMedia
            value={formData.socialMedia}
            onChange={(social) => setFormData({ ...formData, socialMedia: social })}
          />
        )}

        {/* Legal Tab */}
        {activeTab === "legal" && (
          <TermsConditions
            terms={formData.termsConditions}
            howToUse={formData.howToUse}
            onTermsChange={(terms) => setFormData({ ...formData, termsConditions: terms })}
            onHowToUseChange={(howToUse) => setFormData({ ...formData, howToUse })}
          />
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <RevenueSettings
            value={formData.revenueSettings}
            onChange={(settings) => setFormData({ ...formData, revenueSettings: settings })}
          />
        )}

        {/* Brand & Identity Tab */}
        {activeTab === "brand" && (
          <BrandIdentity
            appName={formData.appName}
            urlSlug={formData.urlSlug}
            onAppNameChange={(appName) => setFormData({ ...formData, appName })}
            onUrlSlugChange={(urlSlug) => setFormData({ ...formData, urlSlug })}
          />
        )}

        {/* Theme Tab */}
        {activeTab === "theme" && (
          <div className="bg-[#0d1f3c] shadow rounded-lg p-6 border border-[#1e3a5f]">
            <ThemeSelector
              theme={formData.theme}
              pattern={formData.backgroundPattern}
              restaurantName={formData.name}
              restaurantLogo={formData.logo}
              onThemeChange={(theme) => setFormData({ ...formData, theme })}
              onPatternChange={(pattern) => setFormData({ ...formData, backgroundPattern: pattern })}
            />
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-[#1e3a5f] rounded-lg text-gray-400 hover:bg-[#1e3a5f] hover:text-white transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#fe5502] to-[#e0682e] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}