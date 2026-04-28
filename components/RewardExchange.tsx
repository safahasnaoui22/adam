"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the QR scanner component to avoid SSR issues
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function RewardExchange() {
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);      // shows QR scanner when true
  const [scannerError, setScannerError] = useState(""); // camera / scan errors

  // Called when a QR code is successfully scanned
  const handleScan = (data: string | null) => {
    if (data) {
      // The QR code should contain the full URL to the customer page,
      // e.g. "https://adamrestaurents.vercel.app/scan/CUST-1234"
      try {
        const url = new URL(data);
        const pathParts = url.pathname.split("/");
        const customerId = pathParts[pathParts.length - 1];
        if (customerId) {
          window.location.href = `/scan/${customerId}`;
        } else {
          setScannerError("QR code invalide (ID client manquant)");
        }
      } catch (error) {
        // If data is not a valid URL, try to use it directly as customer ID
        if (data.trim()) {
          window.location.href = `/scan/${data.trim()}`;
        } else {
          setScannerError("QR code invalide");
        }
      }
      setScanning(false);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setScannerError(
      "Impossible d’accéder à la caméra. Vérifiez les autorisations."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerIdInput.trim()) {
      setError("Veuillez entrer un numéro de carte");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/customer/by-id/${encodeURIComponent(customerIdInput.trim())}`);
      const data = await res.json();
      if (res.ok && data.customer && data.customer.customerId) {
        window.location.href = `/scan/${data.customer.customerId}`;
      } else {
        setError(data.error || "Client non trouvé");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0d1f3c] rounded-lg shadow border border-[#1e3a5f] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎁</span>
        <h2 className="text-xl font-semibold text-white">
          Échanger une récompense
        </h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Scannez la carte du client ou saisissez son numéro
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setMode("scan");
            setScanning(true);
            setScannerError("");
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
            setScannerError("");
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
          <div className="bg-black rounded-lg overflow-hidden">
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
            />
          </div>
          {scannerError && (
            <p className="text-xs text-red-400 mt-2">{scannerError}</p>
          )}
          <p className="text-xs text-gray-400 mt-2 text-center">
            Placez le QR code du client devant la caméra.
          </p>
        </div>
      )}

      {mode === "manual" && (
        <form onSubmit={handleSubmit} className="space-y-3">
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

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}