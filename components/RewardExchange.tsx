"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function RewardExchange() {
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerId = "qr-scanner-container";

  // Cleanup scanner when component unmounts or mode changes
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mode === "scan" && scanning) {
      // Small delay to ensure the DOM element is rendered
      setTimeout(() => {
        if (document.getElementById(containerId)) {
          startScanner();
        } else {
          console.error("Container not found");
          setError("Erreur d'initialisation de la caméra");
        }
      }, 200);
    } else {
      // Stop scanner when leaving scan mode
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    }
  }, [mode, scanning]);

  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    try {
      // Ensure the container has explicit size (the scanner may not work without it)
      const container = document.getElementById(containerId);
      if (container) {
        container.style.width = "100%";
        container.style.minHeight = "300px";
      }

      scannerRef.current = new Html5QrcodeScanner(
        containerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      );
      scannerRef.current.render(onScanSuccess, onScanError);
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
    }
  };

  const onScanSuccess = (decodedText: string) => {
    // Stop scanning and close camera
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
    // Process scanned customer ID
    let customerId = decodedText;
    const scanMatch = decodedText.match(/\/scan\/([^\/?#]+)/);
    if (scanMatch) {
      customerId = scanMatch[1];
    }
    window.location.href = `/scan/${customerId}`;
  };

  const onScanError = (err: any) => {
    console.error(err);
    // Only show error if it's not a normal "no QR code found" message
    if (err && !err.includes("No QR code found")) {
      setError("Erreur de lecture, réessayez");
      setTimeout(() => setError(""), 2000);
    }
  };

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

  return (
    <div className="bg-[#0d1f3c] rounded-lg shadow border border-[#1e3a5f] p-6">
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
            if (scannerRef.current) {
              scannerRef.current.clear();
              scannerRef.current = null;
            }
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
          <div
            id={containerId}
            className="overflow-hidden rounded-lg bg-black"
            style={{ minHeight: "300px", width: "100%" }}
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          <p className="text-xs text-gray-400 mt-2 text-center">
            Placez le QR code du client devant la caméra.
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
  );
}