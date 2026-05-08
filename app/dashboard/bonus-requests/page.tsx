"use client";

import { useState, useEffect } from "react";

interface BonusRequest {
  id: string;
  platform: string;
  status: string;
  proofName: string | null;
  requestedAt: string;
  customer: {
    id: string;
    name: string;
    customerId: string;
  };
}

export default function BonusRequestsPage() {
  const [requests, setRequests] = useState<BonusRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/restaurant/bonus-requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/restaurant/bonus-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id));
        alert("✅ Bonus approuvé! Les points ont été ajoutés.");
      } else {
        alert("Erreur lors de l'approbation");
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Raison du rejet (optionnel):");
    setProcessing(id);
    try {
      const res = await fetch(`/api/restaurant/bonus-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectReason: reason || undefined }),
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id));
        alert("Demande rejetée");
      } else {
        alert("Erreur lors du rejet");
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setProcessing(null);
    }
  };

  const getPlatformLabel = (platform: string) => {
    const map: Record<string, string> = {
      googleMaps: "Google Maps",
      facebook: "Facebook",
      instagram: "Instagram",
      twitter: "Twitter/X",
    };
    return map[platform] || platform;
  };

  const getPlatformIcon = (platform: string) => {
    const map: Record<string, string> = {
      googleMaps: "🗺️",
      facebook: "📘",
      instagram: "📸",
      twitter: "🐦",
    };
    return map[platform] || "🎁";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe5502]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Demandes de bonus</h1>
          <p className="text-gray-400">Vérifiez les demandes des clients et approuvez‑les pour leur ajouter des points.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-[#0d1f3c]/50 backdrop-blur-sm rounded-2xl border border-[#1e3a5f]/40 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {requests.map((request) => (
              <div
                key={request.id}
                className="group relative bg-[#0d1f3c] rounded-2xl shadow-xl border border-[#1e3a5f]/40 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:scale-[1.01]"
              >
                {/* Animated gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#fe5502]/5 to-[#e0682e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#fe5502]/10 rounded-xl">
                        <span className="text-2xl">{getPlatformIcon(request.platform)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{request.customer.name}</h3>
                        <p className="text-sm text-gray-400">ID: {request.customer.customerId}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#ffd9b9]/20 text-[#fe5502] rounded-full text-sm font-medium border border-[#fe5502]/30">
                      {getPlatformLabel(request.platform)}
                    </span>
                  </div>
                  
                  {request.proofName && (
                    <div className="mb-4 p-3 bg-[#0a1628] rounded-xl border border-[#1e3a5f]/50">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-white">Nom fourni:</span> {request.proofName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Vérifiez sur Google Maps que ce nom a laissé un avis
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-[#1e3a5f]/30">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Demandé le {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processing === request.id}
                        className="px-4 py-2 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 hover:border-red-500 transition-all duration-200 disabled:opacity-50"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                        className="px-5 py-2 bg-gradient-to-r from-[#fe5502] to-[#e0682e] text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 transform hover:-translate-y-0.5"
                      >
                        {processing === request.id ? (
                          <span className="flex items-center gap-1">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            ...
                          </span>
                        ) : (
                          "Approuver +⭐"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}