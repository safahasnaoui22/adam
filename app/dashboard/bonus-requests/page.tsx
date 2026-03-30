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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe5502]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#282424] mb-2">Demandes de bonus</h1>
      <p className="text-[#7f8489] mb-8">
        Vérifiez les demandes des clients et approuvez-les pour leur ajouter des points.
      </p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-[#7f8489]">Aucune demande en attente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-[#282424]">{request.customer.name}</h3>
                  <p className="text-sm text-[#7f8489]">ID: {request.customer.customerId}</p>
                </div>
                <span className="px-3 py-1 bg-[#ffd9b9] text-[#e0682e] rounded-full text-sm">
                  {getPlatformLabel(request.platform)}
                </span>
              </div>
              
              {request.proofName && (
                <div className="mb-4 p-3 bg-[#fdf9f4] rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Nom fourni:</span> {request.proofName}
                  </p>
                  <p className="text-xs text-[#7f8489] mt-1">
                    Vérifiez sur Google Maps que ce nom a laissé un avis
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#7f8489]">
                  Demandé le {new Date(request.requestedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="px-4 py-2 bg-[#fe5502] text-white rounded-lg hover:bg-[#e0682e] transition-colors"
                  >
                    {processing === request.id ? "..." : "Approuver +⭐"}
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