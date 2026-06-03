"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Restaurant information for the flyer
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);

  // Reference to the flyer element for exporting
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateQRCode();
    fetchRestaurantInfo();
  }, []);

  // Fetch restaurant details (name and logo)
  const fetchRestaurantInfo = async () => {
    try {
      const res = await fetch("/api/restaurant/info");
      const data = await res.json();
      if (res.ok) {
        setRestaurantName(data.name || "Mon Restaurant");
        setRestaurantLogo(data.logo || null);
      } else {
        // Fallback values if endpoint fails
        setRestaurantName("Mon Restaurant");
        setRestaurantLogo(null);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant info:", error);
      setRestaurantName("Mon Restaurant");
      setRestaurantLogo(null);
    }
  };

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

  // Export flyer as PNG
  const downloadPosterAsPNG = async () => {
    if (!flyerRef.current) return;
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `affiche-${restaurantName.replace(/\s/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error generating PNG:", err);
      setError("Impossible de générer l'image");
    }
  };

  // Export flyer as PDF
  const downloadPosterAsPDF = async () => {
    if (!flyerRef.current) return;
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 190; // A4 width in mm with margins
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`affiche-${restaurantName.replace(/\s/g, "-")}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Impossible de générer le PDF");
    }
  };

  // Print the flyer (opens print dialog with optimized styling)
  const printPoster = () => {
    if (!flyerRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Veuillez autoriser les popups pour l'impression");
      return;
    }

    const flyerHtml = flyerRef.current.cloneNode(true) as HTMLElement;
    // Ensure all images are absolute URLs for print
    const images = flyerHtml.querySelectorAll("img");
    images.forEach((img) => {
      if (img.src) {
        img.setAttribute("src", img.src);
      }
    });

    const styles = document.querySelectorAll("link[rel='stylesheet'], style");
    let styleHtml = "";
    styles.forEach((style) => {
      if (style.tagName === "LINK") {
        const link = style as HTMLLinkElement;
        styleHtml += `<link href="${link.href}" rel="stylesheet">`;
      } else {
        styleHtml += style.outerHTML;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Affiche - ${restaurantName}</title>
          ${styleHtml}
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            }
            .print-container {
              max-width: 600px;
              margin: 0 auto;
            }
            button, .no-print {
              display: none;
            }
            .flyer-card {
              box-shadow: none;
              margin: 0;
              border: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${flyerHtml.outerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe5502] mb-4"></div>
          <p className="text-gray-300">Génération de votre QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#2e283d" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          QR Code de votre restaurant
        </h1>
        <p className="text-gray-300 mb-8">
          Vos clients scannent ce code pour accéder à leur carte de fidélité
        </p>

        {error && (
          <div className="bg-[#ffd9b9] text-[#e0682e] p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {qrCode && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Modern Flyer / Affiche */}
            <div className="flex justify-center">
              <div
                ref={flyerRef}
                className="flyer-card w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                {/* Top colored accent bar */}
                <div className="h-2 bg-gradient-to-r from-[#fe5502] to-[#ff8c42]"></div>

                <div className="p-6 text-center">
                  {/* Restaurant Logo */}
                  <div className="flex justify-center mb-4">
                    {restaurantLogo ? (
                      <div className="w-24 h-24 rounded-full bg-gray-100 p-1 shadow-md overflow-hidden">
                        <Image
                          src={restaurantLogo}
                          alt={restaurantName}
                          width={96}
                          height={96}
                          className="rounded-full object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fe5502]/10 to-[#fe5502]/20 flex items-center justify-center shadow-md">
                        <svg
                          className="w-12 h-12 text-[#fe5502]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 22V12h6v10"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Name */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {restaurantName}
                  </h2>

                  {/* Elegant divider line */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-[#fe5502] to-[#ff8c42] rounded-full"></div>
                  </div>

                  {/* Catchphrase */}
                  <div className="mb-6">
                    <p className="text-gray-700 font-medium text-lg">
                      Scannez, collectez, gagnez des points.
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Votre carte de fidélité digitale
                    </p>
                  </div>

                  {/* QR Code Image */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                      <Image
                        src={qrCode}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                  </div>

                  {/* Call to action below QR */}
                  <div className="mt-2 mb-4">
                    <span className="inline-block bg-[#fe5502]/10 text-[#fe5502] font-bold px-4 py-2 rounded-full text-sm tracking-wide">
                      SCANNEZ & CUMULEZ DES POINTS
                    </span>
                  </div>

                  {/* Small decorative footer */}
                  <div className="text-xs text-gray-400 mt-4">
                    Programme de fidélité {restaurantName}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions & Instructions */}
            <div className="space-y-6">
              {/* Download & Print Actions */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Télécharger l'affiche
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadPosterAsPNG}
                    className="flex-1 px-4 py-2.5 bg-[#fe5502] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    PNG
                  </button>
                  <button
                    onClick={downloadPosterAsPDF}
                    className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a75] flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v6h6"
                      />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={printPoster}
                    className="flex-1 px-4 py-2.5 bg-[#2d2d44] text-gray-200 rounded-lg hover:bg-[#3d3d5c] flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Imprimer
                  </button>
                </div>
              </div>

              {/* Regenerate QR Code Button */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Régénérer le QR code
                    </h2>
                    <p className="text-sm text-gray-400">
                      Créez un nouveau code si nécessaire
                    </p>
                  </div>
                  <button
                    onClick={generateQRCode}
                    className="px-5 py-2 border border-[#fe5502] text-[#fe5502] rounded-lg hover:bg-[#fe5502] hover:text-white flex items-center transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Régénérer
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Comment utiliser ce QR code ?
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Imprimez l'affiche ou le QR code
                      </p>
                      <p className="text-sm text-gray-400">
                        Placez-le sur vos tables, comptoir, ou vitrine
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Client scanne le code
                      </p>
                      <p className="text-sm text-gray-400">
                        Avec l'appareil photo de son téléphone
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Client entre son nom
                      </p>
                      <p className="text-sm text-gray-400">
                        Son compte est créé automatiquement
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Carte de fidélité digitale
                      </p>
                      <p className="text-sm text-gray-400">
                        Le client accumule des tampons à chaque visite
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct URL & Stats */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">
                <h2 className="text-lg font-semibold mb-3 text-white">
                  Lien direct
                </h2>
                <div className="flex items-center space-x-2 mb-6">
                  <input
                    type="text"
                    value={restaurantUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-[#2d2d44] rounded-lg bg-[#0f0f1a] text-sm text-white"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-[#2d2d44] text-gray-300 rounded-lg hover:bg-[#fe5502] hover:text-white flex items-center transition-colors"
                  >
                    {copied ? (
                      <>✓ Copié</>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                        Copier
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#ffd9b9] p-5 rounded-xl">
                  <h3 className="font-semibold text-[#e0682e] mb-2">
                    📊 Statistiques
                  </h3>
                  <p className="text-sm text-[#7f8489] mb-4">
                    Suivez le nombre de clients qui scannent votre QR code et
                    rejoignent votre programme.
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
          </div>
        )}
      </div>
    </div>
  );
}