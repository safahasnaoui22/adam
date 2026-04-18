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
        router.push("/dashboard");
        router.refresh();
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

      {/* Tabs */}
      <div className="border-b border-[#1e3a5f] mb-8">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("business")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "business"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Contact & Business
          </button>
          <button
            onClick={() => setActiveTab("hours")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "hours"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Horaires
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "social"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Réseaux sociaux
          </button>
          <button
            onClick={() => setActiveTab("legal")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "legal"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Conditions
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "revenue"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Suivi des revenus
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "brand"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Brand & Identity
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === "theme"
                ? "border-[#fe5502] text-[#fe5502]"
                : "border-transparent text-gray-400 hover:text-white hover:border-[#1e3a5f]"
            }`}
          >
            Thème
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Details Tab */}
        {activeTab === "business" && (
          <div className="bg-[#0d1f3c] shadow rounded-lg p-6 space-y-6 border border-[#1e3a5f]">
            <h2 className="text-xl font-semibold text-white">Contact & Business Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom du commerce *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Logo du commerce
              </label>
              <div className="flex items-center space-x-4">
                {formData.logo && (
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-[#1e3a5f]">
                    <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="border-2 border-dashed border-[#1e3a5f] rounded-lg p-4 text-center hover:border-[#fe5502] transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      onChange={(e) => {
                        // Handle file upload
                      }}
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
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
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description du commerce
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Présentez votre commerce à vos clients..."
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Adresse du commerce
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rue, Ville, Code postal"
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Téléphone (ex : +216 XX XXX XXX)"
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email (ex : contact@adam.tn)"
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="Site web (optionnel)"
                className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
              />
            </div>

            {/* New Section: Social Media Links for Bonuses */}
            <div className="border-t border-[#1e3a5f] pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Liens pour les bonus clients</h3>
              <p className="text-sm text-gray-400 mb-4">
                Ajoutez vos liens et définissez le nombre d'étoiles que les clients gagnent.
              </p>
              
              {/* Google Maps */}
              <div className="mb-6 p-4 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lien Google Maps
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl || ""}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
                />
                
                {/* Code for Google Reviews */}
                <div className="mt-4 pt-4 border-t border-[#1e3a5f]">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Code unique pour avis Google
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.googleMapsCode || ""}
                      readOnly
                      placeholder="Générer un code"
                      className="flex-1 px-3 py-2 border border-[#1e3a5f] rounded-md bg-[#0a1628] text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={generateGoogleCode}
                      className="px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition-colors"
                    >
                      Générer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Affichez ce code dans votre restaurant. Les clients l'utiliseront après avoir laissé un avis Google.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Étoiles gagnées:
                  </label>
                  <input
                    type="number"
                    value={formData.googleMapsBonusStars}
                    onChange={(e) => setFormData({ ...formData, googleMapsBonusStars: parseInt(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
                  />
                  <span className="text-sm text-gray-400">⭐</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Le client gagne ces étoiles après avoir entré le code unique.
                </p>
              </div>

              {/* Facebook */}
              <div className="mb-6 p-4 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lien Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl || ""}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/votrepage"
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white mb-2"
                />
                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Étoiles gagnées:
                  </label>
                  <input
                    type="number"
                    value={formData.facebookBonusStars}
                    onChange={(e) => setFormData({ ...formData, facebookBonusStars: parseInt(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
                  />
                  <span className="text-sm text-gray-400">⭐</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Suivre la page = +{formData.facebookBonusStars}⭐
                </p>
              </div>

              {/* Instagram */}
              <div className="mb-6 p-4 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lien Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl || ""}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/votrepage"
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white mb-2"
                />
                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Étoiles gagnées:
                  </label>
                  <input
                    type="number"
                    value={formData.instagramBonusStars}
                    onChange={(e) => setFormData({ ...formData, instagramBonusStars: parseInt(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
                  />
                  <span className="text-sm text-gray-400">⭐</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Suivre = +{formData.instagramBonusStars}⭐
                </p>
              </div>

              {/* Twitter/X */}
              <div className="mb-6 p-4 bg-[#0a1628] rounded-lg border border-[#1e3a5f]">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Lien Twitter / X
                </label>
                <input
                  type="url"
                  value={formData.twitterUrl || ""}
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/votrepage"
                  className="w-full px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white mb-2"
                />
                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Étoiles gagnées:
                  </label>
                  <input
                    type="number"
                    value={formData.twitterBonusStars}
                    onChange={(e) => setFormData({ ...formData, twitterBonusStars: parseInt(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-[#1e3a5f] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] bg-[#0a1628] text-white"
                  />
                  <span className="text-sm text-gray-400">⭐</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Suivre = +{formData.twitterBonusStars}⭐
                </p>
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
              onThemeChange={(theme) => setFormData({ ...formData, theme })}
              onPatternChange={(pattern) => setFormData({ ...formData, backgroundPattern: pattern })}
            />
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-[#1e3a5f] rounded-md text-gray-400 hover:bg-[#1e3a5f] hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] disabled:opacity-50 transition-colors"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}