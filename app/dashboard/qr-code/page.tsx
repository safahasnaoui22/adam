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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4"></div>
          <p className="text-[#7f8489]">Génération de votre QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#282424] mb-2">QR Code de votre restaurant</h1>
      <p className="text-[#7f8489] mb-8">
        Vos clients scannent ce code pour accéder à leur carte de fidélité
      </p>
      
      {error && (
        <div className="bg-[#ffd9b9] text-[#e0682e] p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {qrCode && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - QR Code */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-6 text-center">
              <div className="inline-block p-4 bg-[#fdf9f4] rounded-xl">
                <Image 
                  src={qrCode} 
                  alt="QR Code" 
                  width={300} 
                  height={300}
                  className="mx-auto"
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCode;
                  link.download = `qr-${Date.now()}.png`;
                  link.click();
                }}
                className="px-4 py-2 bg-[#fe5502] text-white rounded-lg hover:bg-[#e0682e] flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger PNG
              </button>
              
              <button
                onClick={generateQRCode}
                className="px-4 py-2 border border-[#c6c9c8] rounded-lg hover:bg-[#fdf9f4] hover:text-[#282424] flex items-center transition-colors text-[#7f8489]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Régénérer
              </button>
            </div>
          </div>

          {/* Right side - Instructions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#282424]">Comment utiliser ce QR code ?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-[#282424]">Imprimez le QR code</p>
                    <p className="text-sm text-[#7f8489]">Placez-le sur vos tables, comptoir, ou vitrine</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-[#282424]">Client scanne le code</p>
                    <p className="text-sm text-[#7f8489]">Avec l'appareil photo de son téléphone</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-[#282424]">Client entre son nom</p>
                    <p className="text-sm text-[#7f8489]">Son compte est créé automatiquement</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-[#282424]">Carte de fidélité digitale</p>
                    <p className="text-sm text-[#7f8489]">Le client accumule des tampons à chaque visite</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-3 text-[#282424]">Lien direct</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={restaurantUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-[#c6c9c8] rounded-lg bg-[#fdf9f4] text-sm text-[#282424]"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-4 py-2 bg-[#fdf9f4] text-[#7f8489] rounded-lg hover:bg-[#ffd9b9] hover:text-[#fe5502] flex items-center transition-colors"
                >
                  {copied ? (
                    <>✓ Copié</>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#ffd9b9] p-6 rounded-xl">
              <h3 className="font-semibold text-[#e0682e] mb-2">📊 Statistiques</h3>
              <p className="text-sm text-[#7f8489] mb-4">
                Suivez le nombre de clients qui scannent votre QR code et rejoignent votre programme.
              </p>
              <Link
                href="/dashboard/clients"
                className="text-[#fe5502] hover:text-[#e0682e] text-sm font-medium inline-flex items-center transition-colors"
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