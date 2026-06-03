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

// ── Professional SVG icon components ─────────────────────────────────

const IconBuilding = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const IconGoogleMaps = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" stroke="none"/>
    <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
  </svg>
);

const IconFacebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2"/>
    <path d="M16 8h-2a1 1 0 00-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 014-4h2v3z" fill="white"/>
  </svg>
);

const IconInstagram = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80"/>
        <stop offset="25%" stopColor="#FCAF45"/>
        <stop offset="50%" stopColor="#F77737"/>
        <stop offset="75%" stopColor="#C13584"/>
        <stop offset="100%" stopColor="#833AB4"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
    <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="16.5" cy="7.5" r="0.8" fill="white"/>
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#000"/>
    <path d="M18 6L13.5 11.5L18.5 18H15.5L12 13.5L8 18H5.5L10.5 12L5.5 6H8.5L12 10L15.5 6H18Z" fill="white"/>
  </svg>
);

const IconGift = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
);

const IconStar = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconRefresh = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);

const IconChevronLeft = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const IconCheck = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconSave = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const IconSpinner = ({ size = 16 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <circle className="opacity-25" cx="12" cy="12" r="10" strokeOpacity="0.3"/>
    <path className="opacity-75" d="M4 12a8 8 0 018-8" strokeLinecap="round"/>
  </svg>
);

const IconGenerate = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ── Tab definitions ───────────────────────────────────────────────────
const TABS = [
  { id: "business", label: "Contact & Business", icon: <IconBuilding size={15}/> },
  { id: "hours",    label: "Horaires",            icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )},
  { id: "social",   label: "Réseaux sociaux",     icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )},
  { id: "legal",    label: "Conditions",          icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )},
  { id: "revenue",  label: "Revenus",             icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  )},
  { id: "brand",    label: "Brand & Identity",    icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )},
  { id: "theme",    label: "Thème",               icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
    </svg>
  )},
];

// ── Social platform config ─────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    urlKey: "facebookUrl" as const,
    starsKey: "facebookBonusStars" as const,
    placeholder: "https://facebook.com/your-page",
    icon: <IconFacebook size={18}/>,
    hint: "Lien vers votre page Facebook",
  },
  {
    key: "instagram",
    label: "Instagram",
    urlKey: "instagramUrl" as const,
    starsKey: "instagramBonusStars" as const,
    placeholder: "https://instagram.com/your-profile",
    icon: <IconInstagram size={18}/>,
    hint: "Lien vers votre profil Instagram",
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    urlKey: "twitterUrl" as const,
    starsKey: "twitterBonusStars" as const,
    placeholder: "https://x.com/your-handle",
    icon: <IconX size={18}/>,
    hint: "Lien vers votre compte X",
  },
];

type FormData = {
  name: string;
  description: string;
  logo: string | null;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  googleMapsBonusStars: number;
  facebookBonusStars: number;
  instagramBonusStars: number;
  twitterBonusStars: number;
  googleMapsCode: string;
  openingHours: Record<string, any>;
  socialMedia: Record<string, any>;
  termsConditions: string;
  howToUse: string;
  revenueSettings: { avgSpend: number; baseVisits: number; inactiveDays: number };
  appName: string;
  urlSlug: string;
  theme: Record<string, any>;
  backgroundPattern: string;
};

export default function PersonalizePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  const [restaurant, setRestaurant] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    logo: null,
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
    revenueSettings: { avgSpend: 0, baseVisits: 1, inactiveDays: 90 },
    appName: "",
    urlSlug: "",
    theme: {},
    backgroundPattern: "",
  });

  const patch = (partial: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...partial }));

  const generateGoogleCode = () =>
    patch({ googleMapsCode: Math.random().toString(36).substring(2, 10).toUpperCase() });

  useEffect(() => { fetchRestaurant(); }, []);

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
          googleMapsBonusStars: data.googleMapsBonusStars ?? 50,
          facebookBonusStars: data.facebookBonusStars ?? 50,
          instagramBonusStars: data.instagramBonusStars ?? 50,
          twitterBonusStars: data.twitterBonusStars ?? 50,
          googleMapsCode: data.googleMapsCode || "",
          openingHours: data.openingHours || {},
          socialMedia: data.socialMedia || {},
          termsConditions: data.termsConditions || "",
          howToUse: data.howToUse || "",
          revenueSettings: data.revenueSettings || { avgSpend: 0, baseVisits: 1, inactiveDays: 90 },
          appName: data.appName || data.name?.substring(0, 12) || "",
          urlSlug: data.urlSlug || "",
          theme: data.theme || {},
          backgroundPattern: data.backgroundPattern || "",
        });
      }
    } catch (e) {
      console.error(e);
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
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4" />
          <p className="text-gray-400 text-sm">Chargement de vos paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-1">Personnalisez votre carte</h1>
      <p className="text-gray-400 text-sm mb-8">
        Rendez votre carte de fidélité unique. Ces paramètres aident les clients à reconnaître votre commerce.
      </p>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? "bg-[#fe5502] text-white shadow-md shadow-orange-500/20"
                : "bg-[#0a1628] text-gray-400 hover:text-white hover:bg-[#1e3a5f] border border-[#1e3a5f]"
              }
            `}
          >
            <span className={activeTab === tab.id ? "text-white" : "text-gray-500"}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Business Tab ── */}
        {activeTab === "business" && (
          <div className="bg-[#0d1f3c] rounded-2xl border border-[#1e3a5f]/50 p-6 md:p-8">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#1e3a5f]/50">
              <div className="w-9 h-9 rounded-lg bg-[#fe5502]/10 flex items-center justify-center text-[#fe5502]">
                <IconBuilding size={18} color="#fe5502"/>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Informations du commerce</h2>
                <p className="text-xs text-gray-500 mt-0.5">Affichées sur la carte de fidélité de vos clients</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Nom du commerce <span className="text-[#fe5502]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#fe5502] focus:border-[#fe5502] text-white text-sm placeholder-gray-600 transition"
                    placeholder="Ex: Café Central"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Logo du commerce
                  </label>
                  <div className="flex items-start gap-4">
                    {formData.logo && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#1e3a5f] flex-shrink-0">
                        <Image src={formData.logo} alt="Logo" width={64} height={64} className="object-cover w-full h-full"/>
                      </div>
                    )}
                    <div className="flex-1 border border-dashed border-[#1e3a5f] rounded-lg p-4 text-center hover:border-[#fe5502]/50 transition cursor-pointer bg-[#0a1628]/50">
                      <input type="file" accept="image/*" className="hidden" id="logo-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => patch({ logo: reader.result as string });
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <svg className="mx-auto h-8 w-8 text-gray-600 mb-1" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <p className="text-xs text-[#fe5502]">Importer un logo</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">PNG, JPG — max 2MB</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder="Présentez votre commerce à vos clients..."
                    className="w-full px-3.5 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#fe5502] focus:border-[#fe5502] text-white text-sm placeholder-gray-600 transition resize-none"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {[
                  { label: "Adresse", key: "address" as const, type: "text", placeholder: "Rue, Ville, Code postal", icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  )},
                  { label: "Téléphone", key: "phoneNumber" as const, type: "tel", placeholder: "+216 XX XXX XXX", icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.22 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.65-.65a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  )},
                  { label: "Email", key: "email" as const, type: "email", placeholder: "contact@example.com", icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  )},
                  { label: "Site web", key: "website" as const, type: "url", placeholder: "https://...", icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  )},
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {field.icon}
                      </div>
                      <input
                        type={field.type}
                        value={formData[field.key] as string}
                        onChange={(e) => patch({ [field.key]: e.target.value } as any)}
                        placeholder={field.placeholder}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#0a1628] border border-[#1e3a5f] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#fe5502] focus:border-[#fe5502] text-white text-sm placeholder-gray-600 transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bonus clients ── */}
            {/* ── Bonus clients ── */}
<div className="border-t border-[#1e3a5f]/50 pt-6 mt-6">
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-lg bg-[#fe5502]/10 flex items-center justify-center text-[#fe5502]">
      <IconGift size={18} color="#fe5502"/>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-white">Bonus clients</h3>
        <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#fe5502]/15 text-[#fe5502] px-2 py-0.5 rounded-full">Nouveau</span>
      </div>
      <p className="text-xs text-gray-500 mt-0.5">
        Les clients gagnent des points en visitant vos liens — une seule fois par plateforme.
      </p>
    </div>
  </div>

  {/* Google Maps row */}
  <div className="mb-4 p-4 bg-[#0a1628] rounded-xl border border-[#1e3a5f] hover:border-[#1e3a5f]/80 transition">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <IconGoogleMaps size={20}/>
        <span className="text-sm font-medium text-white">Google Maps</span>
        <span className="text-[10px] text-gray-500 bg-[#1e3a5f]/60 px-2 py-0.5 rounded">Avis + suivi</span>
      </div>
      <div className="flex items-center gap-2">
        <IconStar size={13} color="#fe5502"/>
        <input
          type="number"
          value={formData.googleMapsBonusStars}
          onChange={(e) => patch({ googleMapsBonusStars: parseInt(e.target.value) || 0 })}
          className="w-16 px-2 py-1 bg-[#1e3a5f]/50 border border-[#1e3a5f] rounded-md text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#fe5502]"
        />
        <span className="text-xs text-gray-500">pts</span>
      </div>
    </div>
    <input
      type="url"
      value={formData.googleMapsUrl || ""}
      onChange={(e) => patch({ googleMapsUrl: e.target.value })}
      placeholder="https://maps.app.goo.gl/..."
      className="w-full px-3.5 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fe5502] focus:border-[#fe5502] transition"
    />
  </div>

  {/* Facebook / Instagram / TikTok */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {SOCIAL_PLATFORMS.map((platform) => (
      <div key={platform.key} className="p-4 bg-[#0a1628] rounded-xl border border-[#1e3a5f] hover:border-[#1e3a5f]/80 transition">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {platform.icon}
            <span className="text-sm font-medium text-white">{platform.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IconStar size={12} color="#fe5502"/>
            <input
              type="number"
              value={formData[platform.starsKey]}
              onChange={(e) => patch({ [platform.starsKey]: parseInt(e.target.value) || 0 } as any)}
              className="w-14 px-2 py-1 bg-[#1e3a5f]/50 border border-[#1e3a5f] rounded-md text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fe5502]"
            />
            <span className="text-[10px] text-gray-500">pts</span>
          </div>
        </div>
        <input
          type="url"
          value={formData[platform.urlKey]}
          onChange={(e) => patch({ [platform.urlKey]: e.target.value } as any)}
          placeholder={platform.placeholder}
          className="w-full px-3 py-2 bg-[#0a1628] border border-[#1e3a5f] rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fe5502] focus:border-[#fe5502] transition"
        />
        <p className="text-[10px] text-gray-600 mt-1.5">{platform.hint}</p>
      </div>
    ))}
  </div>
</div>
          </div>
        )}

        {/* ── Other tabs ── */}
        {activeTab === "hours" && (
          <OpeningHours value={formData.openingHours} onChange={(hours) => patch({ openingHours: hours })}/>
        )}
        {activeTab === "social" && (
          <SocialMedia value={formData.socialMedia} onChange={(social) => patch({ socialMedia: social })}/>
        )}
        {activeTab === "legal" && (
          <TermsConditions
            terms={formData.termsConditions}
            howToUse={formData.howToUse}
            onTermsChange={(terms) => patch({ termsConditions: terms })}
            onHowToUseChange={(howToUse) => patch({ howToUse })}
          />
        )}
        {activeTab === "revenue" && (
          <RevenueSettings value={formData.revenueSettings} onChange={(s) => patch({ revenueSettings: s })}/>
        )}
        {activeTab === "brand" && (
          <BrandIdentity
            appName={formData.appName}
            urlSlug={formData.urlSlug}
            onAppNameChange={(appName) => patch({ appName })}
            onUrlSlugChange={(urlSlug) => patch({ urlSlug })}
          />
        )}
        {activeTab === "theme" && (
          <div className="bg-[#0d1f3c] rounded-2xl border border-[#1e3a5f]/50 p-6">
            <ThemeSelector
              theme={formData.theme}
              pattern={formData.backgroundPattern}
              restaurantName={formData.name}
              restaurantLogo={formData.logo}
              onThemeChange={(theme) => patch({ theme })}
              onPatternChange={(pattern) => patch({ backgroundPattern: pattern })}
            />
          </div>
        )}

        {/* ── Action bar ── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#1e3a5f] rounded-lg text-sm text-gray-400 hover:bg-[#1e3a5f] hover:text-white transition-all"
          >
            <IconChevronLeft size={15} color="currentColor"/>
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#fe5502] text-white rounded-lg text-sm font-semibold hover:bg-[#e0682e] disabled:opacity-50 transition-all shadow-md shadow-orange-500/20"
          >
            {saving ? (
              <>
                <IconSpinner size={15}/>
                Enregistrement...
              </>
            ) : (
              <>
                <IconSave size={15} color="#fff"/>
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}