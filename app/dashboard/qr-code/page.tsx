"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const res = await fetch("/api/restaurant/generate-qr");
      const data = await res.json();

      if (res.ok) {
        setQrCode(data.qrCode);
        setRestaurantUrl(data.url);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(restaurantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-gray-300 text-lg">
            Génération de votre QR code...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
          QR Code de votre restaurant
        </h1>
        <p className="text-gray-300 text-lg">
          Vos clients scannent ce code pour accéder à leur carte de fidélité
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-8 border border-red-200">
          {error}
        </div>
      )}

      {qrCode && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] border border-blue-900 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-5 bg-[#132B4F] rounded-2xl border border-blue-700 shadow-inner">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="mx-auto rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = qrCode;
                  link.download = `qr-${Date.now()}.png`;
                  link.click();
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg"
              >
                Télécharger PNG
              </button>

              <button
                onClick={generateQRCode}
                className="px-6 py-3 border border-blue-700 bg-[#132B4F] hover:bg-[#1A3A66] text-white rounded-xl font-medium transition-all duration-300"
              >
                Régénérer
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] border border-blue-900 rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Comment utiliser ce QR code ?
              </h2>

              <div className="space-y-5">
                {[
                  {
                    title: "Imprimez le QR code",
                    desc: "Placez-le sur vos tables, comptoir ou vitrine",
                  },
                  {
                    title: "Client scanne le code",
                    desc: "Avec l’appareil photo de son téléphone",
                  },
                  {
                    title: "Client entre son nom",
                    desc: "Son compte est créé automatiquement",
                  },
                  {
                    title: "Carte de fidélité digitale",
                    desc: "Le client accumule des tampons à chaque visite",
                  },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-medium text-white">
                        {step.title}
                      </p>
                      <p className="text-sm text-gray-300">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Link */}
            <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] border border-blue-900 rounded-2xl shadow-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Lien direct
              </h2>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={restaurantUrl}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl bg-[#132B4F] border border-blue-700 text-white outline-none"
                />

                <button
                  onClick={handleCopyUrl}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300"
                >
                  {copied ? "✓ Copié" : "Copier"}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-[#0B1F3A] to-[#102C57] border border-blue-900 rounded-2xl shadow-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-3">
                📊 Statistiques
              </h3>

              <p className="text-gray-300 text-sm mb-5 leading-relaxed">
                Suivez le nombre de clients qui scannent votre QR code
                et rejoignent votre programme de fidélité.
              </p>

              <Link
                href="/dashboard/clients"
                className="inline-flex items-center text-blue-300 hover:text-white font-medium transition-colors duration-300"
              >
                Voir mes clients →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}