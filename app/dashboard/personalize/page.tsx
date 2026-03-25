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
    
    // These will be handled by subcomponents
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p>Chargement de vos paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Personnalisez votre carte</h1>
      <p className="text-gray-600 mb-8">
        Rendez votre carte de fidélité unique. Ces paramètres aident les clients à reconnaître votre commerce.
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("business")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "business"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Contact & Business
          </button>
          <button
            onClick={() => setActiveTab("hours")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "hours"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Horaires
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "social"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Réseaux sociaux
          </button>
          <button
            onClick={() => setActiveTab("legal")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "legal"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Conditions
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "revenue"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Suivi des revenus
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "brand"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Brand & Identity
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "theme"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Thème
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Details Tab */}
        {activeTab === "business" && (
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Contact & Business Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du commerce *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo du commerce
              </label>
              <div className="flex items-center space-x-4">
                {formData.logo && (
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden border">
                    <Image src={formData.logo} alt="Logo" fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition">
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
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="text-indigo-600">Importer un logo</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description du commerce
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Présentez votre commerce à vos clients..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse du commerce
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rue, Ville, Code postal"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Téléphone (ex : +216 XX XXX XXX)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email (ex : contact@adam.tn)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="Site web (optionnel)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
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
     {/* Theme Tab */}
{activeTab === "theme" && (
  <div className="bg-white shadow rounded-lg p-6">
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
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}