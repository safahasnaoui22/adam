"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Professional icons (Feather style)
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const PdfIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v6h6" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateQRCode();
    fetchRestaurantInfo();
  }, []);

  const generateQRCode = async () => {
    try {
      const res = await fetch("/api/restaurant/generate-qr");
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setRestaurantUrl(data.url);
        setRestaurantName(data.restaurantName || "Mon Restaurant");
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantInfo = async () => {
    try {
      const res = await fetch("/api/restaurant/info");
      const data = await res.json();
      if (res.ok && data.logo) {
        setRestaurantLogo(data.logo);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant info:", error);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(restaurantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waitForImages = (element: HTMLElement): Promise<void> => {
    const images = Array.from(element.querySelectorAll("img"));
    const promises = images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    );
    return Promise.all(promises).then(() => {});
  };

  const downloadPosterAsPNG = async () => {
    if (!flyerRef.current || exporting) return;
    setExporting(true);
    try {
      await waitForImages(flyerRef.current);
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        backgroundColor: "#FF8C00",
        logging: false,
        useCORS: true,
        allowTaint: false,
      });
      const link = document.createElement("a");
      link.download = `affiche-${restaurantName.replace(/\s/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error generating PNG:", err);
      setError("Impossible de générer l'image. Réessayez.");
    } finally {
      setExporting(false);
    }
  };

  const downloadPosterAsPDF = async () => {
    if (!flyerRef.current || exporting) return;
    setExporting(true);
    try {
      await waitForImages(flyerRef.current);
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        backgroundColor: "#FF8C00",
        logging: false,
        useCORS: true,
        allowTaint: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 190;
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
      setError("Impossible de générer le PDF. Réessayez.");
    } finally {
      setExporting(false);
    }
  };

  const printPoster = () => {
    if (!flyerRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Veuillez autoriser les popups pour l'impression");
      return;
    }
    const flyerHtml = flyerRef.current.cloneNode(true) as HTMLElement;
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
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
            .print-container { max-width: 600px; margin: 0 auto; }
            button, .no-print { display: none; }
          </style>
        </head>
        <body>
          <div class="print-container">${flyerHtml.outerHTML}</div>
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading && !qrCode) {
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
        <h1 className="text-3xl font-bold text-white mb-2">QR Code de votre restaurant</h1>
        <p className="text-gray-300 mb-8">
          Vos clients scannent ce code pour accéder à leur carte de fidélité
        </p>

        {error && (
          <div className="bg-[#ffd9b9] text-[#e0682e] p-4 rounded-md mb-6">{error}</div>
        )}

        {qrCode && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side: Flyer + download buttons */}
            <div className="space-y-6">
              {/* ── NEW FLYER ── */}
              <div
                ref={flyerRef}
                className="flyer-card w-full max-w-md mx-auto rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#FF8C00",
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                }}
              >
                {/* Title */}
                <h2
                  style={{
                    color: "white",
                    fontSize: "2.4rem",
                    fontWeight: 900,
                    letterSpacing: "3px",
                    textShadow: "2px 2px 0 rgba(0,0,0,0.18)",
                    margin: "0 0 1.5rem",
                  }}
                >
                  SCAN TO WIN
                </h2>

                {/* Open gift box SVG with QR inside */}
                <div style={{ position: "relative", width: "100%" }}>
                  <svg
                    viewBox="0 0 320 360"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "100%", maxWidth: "320px", margin: "0 auto", display: "block" }}
                  >
                    {/* === BOX LID (open / flipped back) === */}
                    {/* Left lid flap */}
                    <polygon points="50,165 160,125 160,95 50,135" fill="#4B3F8A" />
                    {/* Right lid flap */}
                    <polygon points="270,165 160,125 160,95 270,135" fill="#3D337A" />
                    {/* Lid front face */}
                    <rect x="50" y="135" width="220" height="30" rx="4" fill="#5A4CA0" />
                    {/* Lid ribbon vertical */}
                    <rect x="149" y="95" width="22" height="70" fill="#C0C0D8" rx="3" opacity="0.9" />
                    {/* Bow left loop */}
                    <ellipse cx="147" cy="106" rx="21" ry="13" fill="#D4D4EC" transform="rotate(-28 147 106)" opacity="0.92" />
                    {/* Bow right loop */}
                    <ellipse cx="173" cy="106" rx="21" ry="13" fill="#B8B8D0" transform="rotate(28 173 106)" opacity="0.92" />
                    {/* Bow center knot */}
                    <circle cx="160" cy="108" r="9" fill="#E0E0F0" />

                    {/* === BOX BODY === */}
                    {/* Body shadow / depth */}
                    <rect x="53" y="168" width="214" height="158" rx="6" fill="#2E2560" />
                    {/* Body main face */}
                    <rect x="50" y="165" width="220" height="158" rx="6" fill="#4B3F8A" />
                    {/* Body left shading */}
                    <rect x="50" y="165" width="30" height="158" rx="6" fill="#3D337A" />

                    {/* === QR CODE inside box === */}
                    {/* White card */}
                    <rect x="78" y="178" width="164" height="132" rx="8" fill="white" />
                    {/* Real QR image rendered via foreignObject */}
                    <foreignObject x="84" y="184" width="152" height="120">
                      <img
                        src={qrCode}
                        alt="QR Code"
                        style={{ width: "152px", height: "120px", objectFit: "contain" }}
                        crossOrigin="anonymous"
                      />
                    </foreignObject>

                    {/* Body ribbon vertical */}
                    <rect x="149" y="165" width="22" height="158" fill="#C0C0D8" rx="2" opacity="0.65" />
                  </svg>
                </div>

                {/* Restaurant name */}
                <p
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1rem",
                    marginTop: "1rem",
                    marginBottom: "0.25rem",
                    letterSpacing: "0.5px",
                    textShadow: "1px 1px 0 rgba(0,0,0,0.15)",
                  }}
                >
                  {restaurantName}
                </p>

                {/* Tagline */}
                <p
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    letterSpacing: "1.5px",
                    margin: "0",
                    textShadow: "1px 1px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  SCANNEZ, GAGNEZ DES POINTS ET RECEVEZ DES CADEAUX !
                </p>
              </div>

              {/* Download buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={downloadPosterAsPNG}
                  disabled={exporting}
                  className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#fe5502] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <DownloadIcon />
                  <span className="ml-2">PNG</span>
                </button>
                <button
                  onClick={downloadPosterAsPDF}
                  disabled={exporting}
                  className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a75] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <PdfIcon />
                  <span className="ml-2">PDF</span>
                </button>
                <button
                  onClick={printPoster}
                  className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#2d2d44] text-gray-200 rounded-lg hover:bg-[#3d3d5c] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <PrintIcon />
                  <span className="ml-2">Imprimer</span>
                </button>
              </div>
            </div>

            {/* Right column: Instructions, URL, Stats */}
            <div className="space-y-6">
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">
                <h2 className="text-xl font-semibold mb-4 text-white">Comment utiliser ce QR code ?</h2>
                <div className="space-y-4">
                  {[
                    "Imprimez l'affiche ou le QR code – Placez-le sur vos tables, comptoir, ou vitrine",
                    "Client scanne le code – Avec l'appareil photo de son téléphone",
                    "Client entre son nom – Son compte est créé automatiquement",
                    "Carte de fidélité digitale – Le client accumule des tampons à chaque visite",
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#fe5502]/20 text-[#fe5502] rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-gray-300 text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">
                <h2 className="text-lg font-semibold mb-3 text-white">Lien direct</h2>
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
                      <span>✓ Copié</span>
                    ) : (
                      <>
                        <CopyIcon />
                        <span className="ml-1">Copier</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#ffd9b9] p-5 rounded-xl">
                  <h3 className="font-semibold text-[#e0682e] mb-2 flex items-center gap-2">
                    <span>📊</span> Statistiques
                  </h3>
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
          </div>
        )}
      </div>
    </div>
  );
}