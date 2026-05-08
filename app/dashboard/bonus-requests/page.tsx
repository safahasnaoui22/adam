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
        setRequests(requests.filter((r) => r.id !== id));
        alert("✅ Bonus approuvé ! Les points ont été ajoutés.");
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
        body: JSON.stringify({
          action: "reject",
          rejectReason: reason || undefined,
        }),
      });

      if (res.ok) {
        setRequests(requests.filter((r) => r.id !== id));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-b-2 border-blue-400 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
          Demandes de bonus
        </h1>

        <p className="text-gray-300 text-lg">
          Vérifiez les demandes des clients et approuvez-les pour leur ajouter
          des points.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] border border-blue-900 rounded-2xl shadow-2xl p-10 text-center">
          <p className="text-gray-300 text-lg">
            Aucune demande en attente
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] border border-blue-900 rounded-2xl shadow-2xl p-7"
            >
              {/* Top section */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {request.customer.name}
                  </h3>

                  <p className="text-sm text-gray-300 mt-1">
                    ID: {request.customer.customerId}
                  </p>
                </div>

                <span className="inline-flex px-4 py-2 rounded-full bg-[#132B4F] border border-blue-700 text-blue-200 text-sm font-medium">
                  {getPlatformLabel(request.platform)}
                </span>
              </div>

              {/* Proof section */}
              {request.proofName && (
                <div className="mb-6 p-5 rounded-xl bg-[#132B4F] border border-blue-700">
                  <p className="text-sm text-white">
                    <span className="font-semibold">
                      Nom fourni :
                    </span>{" "}
                    {request.proofName}
                  </p>

                  <p className="text-xs text-gray-300 mt-2">
                    Vérifiez sur Google Maps que ce nom a laissé un avis.
                  </p>
                </div>
              )}

              {/* Bottom section */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <p className="text-sm text-gray-300">
                  Demandé le{" "}
                  {new Date(request.requestedAt).toLocaleDateString()}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="px-5 py-3 rounded-xl border border-red-400 text-red-300 hover:bg-red-500/10 transition-all duration-300 font-medium"
                  >
                    Rejeter
                  </button>

                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 font-medium shadow-lg"
                  >
                    {processing === request.id
                      ? "Traitement..."
                      : "Approuver +⭐"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}