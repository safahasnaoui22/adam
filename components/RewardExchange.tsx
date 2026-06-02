"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function RewardExchange() {
  // --- Existing state for reward exchange ---
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  // --- New state for "Ajouter des Points" modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pointsCustomerId, setPointsCustomerId] = useState("");
  const [pointsValue, setPointsValue] = useState<number>(0);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState("");
  const [pointsSuccess, setPointsSuccess] = useState("");

  // --- Cleanup scanner on unmount (existing) ---
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  // --- Scanner functions (existing) ---
  const startScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }

    html5QrCodeRef.current = new Html5Qrcode(containerId);
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 30,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          let customerId = decodedText;
          const scanMatch = decodedText.match(/\/scan\/([^\/?#]+)/);
          if (scanMatch) customerId = scanMatch[1];
          window.location.href = `/scan/${customerId}`;
        },
        (errorMessage) => {
          if (errorMessage && !errorMessage.includes("NoMultiCode") && !errorMessage.includes("No QR")) {
            console.warn(errorMessage);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }
  };

  useEffect(() => {
    if (mode === "scan" && scanning) {
      setTimeout(() => {
        startScanner();
      }, 100);
    } else if (mode !== "scan") {
      stopScanner();
    }
  }, [mode, scanning]);

  // --- Existing manual submit (reward exchange) ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let rawInput = customerIdInput.trim();
    if (!rawInput) {
      setError("Veuillez entrer un numéro de carte");
      return;
    }
    if (rawInput.startsWith("#")) rawInput = rawInput.slice(1);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/customer/by-id/${encodeURIComponent(rawInput)}`);
      const data = await res.json();
      if (res.ok && data.customer && data.customer.customerId) {
        window.location.href = `/scan/${data.customer.customerId}`;
      } else {
        setError(data.error || "Client non trouvé");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // --- New function: Add points to a customer ---
  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setPointsError("");
    setPointsSuccess("");

    let rawId = pointsCustomerId.trim();
    if (!rawId) {
      setPointsError("Veuillez entrer un ID client");
      return;
    }
    if (rawId.startsWith("#")) rawId = rawId.slice(1);

    if (pointsValue <= 0) {
      setPointsError("Le nombre de points doit être supérieur à 0");
      return;
    }

    setPointsLoading(true);

    try {
      // 1. Validate customer exists
      const validateRes = await fetch(`/api/customer/by-id/${encodeURIComponent(rawId)}`);
      const validateData = await validateRes.json();
      if (!validateRes.ok || !validateData.customer || !validateData.customer.customerId) {
        setPointsError(validateData.error || "Client non trouvé");
        setPointsLoading(false);
        return;
      }

      const fullCustomerId = validateData.customer.customerId;

      // 2. Send points addition request
      // --- TODO: Replace with your actual API endpoint ---
      const addPointsRes = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: fullCustomerId,
          points: pointsValue,
        }),
      });

      const addPointsData = await addPointsRes.json();

      if (addPointsRes.ok) {
        setPointsSuccess(`${pointsValue} points ajoutés avec succès !`);
        // Reset form and close modal after a short delay
        setTimeout(() => {
          setIsModalOpen(false);
          setPointsCustomerId("");
          setPointsValue(0);
          setPointsSuccess("");
        }, 1500);
      } else {
        setPointsError(addPointsData.error || "Erreur lors de l'ajout des points");
      }
    } catch (err) {
      console.error(err);
      setPointsError("Erreur de connexion au serveur");
    } finally {
      setPointsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* --- Title & Subtitle --- */}
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        <p className="text-gray-300 mt-1">Bienvenue sur votre tableau de bord de fidélité</p>
      </div>

      {/* --- Left side "Ajouter des Points" button --- */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#fe5502] to-[#ff7a2f] text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
        >
          <span className="text-xl">⭐</span>
          Ajouter des Points
        </button>
      </div>

      {/* --- Existing RewardExchange Card --- */}
      <div className="bg-[#0d1f3c] rounded-2xl shadow-2xl border border-[#1e3a5f]/40 p-6 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎁</span>
          <h2 className="text-xl font-semibold text-white">Échanger une récompense</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">Scannez la carte du client ou saisissez son numéro</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setMode("scan");
              setScanning(true);
              setError("");
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "scan"
                ? "bg-[#fe5502] text-white"
                : "bg-[#1e3a5f] text-gray-300 hover:bg-[#2a4a7a]"
            }`}
          >
            📷 Scanner
          </button>
          <button
            onClick={() => {
              setMode("manual");
              setScanning(false);
              setError("");
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "manual"
                ? "bg-[#fe5502] text-white"
                : "bg-[#1e3a5f] text-gray-300 hover:bg-[#2a4a7a]"
            }`}
          >
            ✏️ Saisir le numéro
          </button>
        </div>

        {mode === "scan" && scanning && (
          <div className="mt-2 mb-4">
            <div id={containerId} className="overflow-hidden rounded-lg bg-black" style={{ minHeight: "300px", width: "100%" }} />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <p className="text-xs text-gray-400 mt-2 text-center">
              Placez le QR code bien éclairé dans le cadre.
            </p>
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Ex: CUST-123456-ABC ou 9A3F (4 derniers chiffres)"
              value={customerIdInput}
              onChange={(e) => setCustomerIdInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e3a5f] border border-[#2a4a7a] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe5502]"
            />
            <p className="text-xs text-gray-400 mt-1">
              Vous pouvez saisir le code complet visible sur la carte ou les 4
              derniers caractères (ex: #9A3F → saisir 9A3F).
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition disabled:opacity-50"
            >
              {loading ? "Recherche..." : "Détecter"}
            </button>
          </form>
        )}
      </div>

      {/* --- Modal: Ajouter des Points --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all">
          <div className="bg-[#0d1f3c] rounded-2xl shadow-2xl border border-[#fe5502]/30 w-full max-w-md mx-4 p-6 animate-fadeInUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⭐</span> Ajouter des Points
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPointsError("");
                  setPointsSuccess("");
                  setPointsCustomerId("");
                  setPointsValue(0);
                }}
                className="text-gray-400 hover:text-white text-2xl leading-5"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddPoints} className="space-y-4">
              {/* Client ID field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  1. ID Client <span className="text-[#fe5502]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: CUST-123456-ABC ou 9A3F"
                  value={pointsCustomerId}
                  onChange={(e) => setPointsCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e3a5f] border border-[#2a4a7a] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe5502]"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Vous pouvez scanner le QR code ou saisir le code manuellement.
                </p>
              </div>

              {/* Stars / Points field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  2. Nombre d'étoiles / points
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pointsValue}
                  onChange={(e) => setPointsValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#1e3a5f] border border-[#2a4a7a] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe5502]"
                  required
                />
              </div>

              {pointsError && <p className="text-sm text-red-400">{pointsError}</p>}
              {pointsSuccess && <p className="text-sm text-green-400">{pointsSuccess}</p>}

              <button
                type="submit"
                disabled={pointsLoading}
                className="w-full py-2.5 bg-[#fe5502] text-white rounded-md hover:bg-[#e0682e] transition disabled:opacity-50 font-medium"
              >
                {pointsLoading ? "Envoi en cours..." : "Valider et envoyer"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Optional: add a tiny CSS animation for the modal */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}