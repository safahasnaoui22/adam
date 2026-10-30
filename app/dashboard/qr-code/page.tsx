"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Image from "next/image";

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

const StoreIcon = () => (
  <svg className="w-12 h-12 text-[#f46e4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
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
  const [flyerExporting, setFlyerExporting] = useState(false);
  const [qrExporting, setQrExporting] = useState(false);

  const flyerRef = useRef<HTMLDivElement>(null);
  const qrCardRef = useRef<HTMLDivElement>(null);

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

  // Wait for images and fonts before capturing. This prevents logos or the
  // gift-box artwork from being captured before they are ready.
  const waitForImages = async (element: HTMLElement): Promise<void> => {
    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      images.map(async (img) => {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }
        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            // A loaded image can still be usable when decode() rejects.
          }
        }
      })
    );

    if ("fonts" in document) {
      try {
        await document.fonts.ready;
      } catch {
        // Continue with the browser's available fonts.
      }
    }
  };

  // Export the flyer at the same fixed design width as the intended preview.
  // The dashboard's two-column layout can shrink the visible card on desktop;
  // capturing that shrunken width changes the spacing and proportions.
  const captureElement = async (
    element: HTMLElement,
    fixedWidth?: number
  ): Promise<HTMLCanvasElement> => {
    await waitForImages(element);

    const exportWidth = fixedWidth ?? Math.ceil(element.getBoundingClientRect().width);

    return html2canvas(element, {
      scale: 4,
      width: exportWidth,
      windowWidth: exportWidth,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      onclone: (clonedDocument) => {
        const selector =
          element === flyerRef.current ? ".flyer-card" : ".qr-card";
        const clonedElement = clonedDocument.querySelector(
          selector
        ) as HTMLElement | null;

        if (clonedElement && fixedWidth) {
          clonedElement.style.width = `${fixedWidth}px`;
          clonedElement.style.minWidth = `${fixedWidth}px`;
          clonedElement.style.maxWidth = `${fixedWidth}px`;
          clonedElement.style.margin = "0";
          clonedElement.style.transform = "none";
          clonedElement.style.boxSizing = "border-box";
        }
      },
    });
  };

  const safeFileName = (prefix: string) =>
    `${prefix}-${restaurantName.trim().replace(/[^\w-]+/g, "-") || "restaurant"}`;

  const downloadCanvasAsPNG = (canvas: HTMLCanvasElement, fileName: string) => {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Place the complete design on one A4 page without stretching or cropping.
  const saveCanvasAsPDF = (
    canvas: HTMLCanvasElement,
    fileName: string,
    maxWidth = 190,
    maxHeight = 277
  ) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const imageWidth = canvas.width * ratio;
    const imageHeight = canvas.height * ratio;
    const x = (210 - imageWidth) / 2;
    const y = (297 - imageHeight) / 2;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      x,
      y,
      imageWidth,
      imageHeight,
      undefined,
      "FAST"
    );
    pdf.save(fileName);
  };

  // Print the exact captured design instead of rebuilding it in a new window
  // with copied Tailwind styles. The print image keeps every element in place.
  const printCanvas = (canvas: HTMLCanvasElement, title: string, printWindow: Window) => {
    if (!printWindow || printWindow.closed) {
      setError("Veuillez autoriser les popups pour l'impression");
      return;
    }

    const imageUrl = canvas.toDataURL("image/png");
    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title.replace(/[<>&"]/g, "")}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              min-height: 100%;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
            }
            img {
              display: block;
              width: auto;
              height: auto;
              max-width: 190mm;
              max-height: 277mm;
              object-fit: contain;
              page-break-inside: avoid;
            }
            @media screen {
              body { min-height: 100vh; padding: 16px; }
              img { max-width: min(190mm, 95vw); max-height: 95vh; }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="${title.replace(/[<>&"]/g, "")}" />
          <script>
            const image = document.querySelector("img");
            const startPrint = () => setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
            image.onload = startPrint;
            image.onerror = () => window.close();
            if (image.complete && image.naturalWidth > 0) startPrint();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // FLYER export functions
  const downloadPosterAsPNG = async () => {
    if (!flyerRef.current || flyerExporting) return;
    setFlyerExporting(true);
    setError("");
    try {
      const canvas = await captureElement(flyerRef.current, 448);
      downloadCanvasAsPNG(canvas, `${safeFileName("affiche")}.png`);
    } catch (err) {
      console.error("Error generating PNG:", err);
      setError("Impossible de générer l'image. Réessayez.");
    } finally {
      setFlyerExporting(false);
    }
  };

  const downloadPosterAsPDF = async () => {
    if (!flyerRef.current || flyerExporting) return;
    setFlyerExporting(true);
    setError("");
    try {
      const canvas = await captureElement(flyerRef.current, 448);
      saveCanvasAsPDF(canvas, `${safeFileName("affiche")}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Impossible de générer le PDF. Réessayez.");
    } finally {
      setFlyerExporting(false);
    }
  };

  const printPoster = async () => {
    if (!flyerRef.current || flyerExporting) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Veuillez autoriser les popups pour l'impression");
      return;
    }
    setFlyerExporting(true);
    setError("");
    try {
      const canvas = await captureElement(flyerRef.current, 448);
      printCanvas(canvas, `Affiche - ${restaurantName}`, printWindow);
    } catch (err) {
      printWindow.close();
      console.error("Error preparing flyer for print:", err);
      setError("Impossible de préparer l'affiche pour l'impression. Réessayez.");
    } finally {
      setFlyerExporting(false);
    }
  };

  // STANDALONE QR CODE exports. The QR is captured at high resolution and
  // fitted proportionally; it is never stretched to fill a PDF page.
  const downloadQRCodeAsPNG = async () => {
    if (!qrCardRef.current || qrExporting) return;
    setQrExporting(true);
    setError("");
    try {
      const canvas = await captureElement(qrCardRef.current);
      downloadCanvasAsPNG(canvas, `${safeFileName("qr-code")}.png`);
    } catch (err) {
      console.error("Error generating QR PNG:", err);
      setError("Impossible de générer le QR code. Réessayez.");
    } finally {
      setQrExporting(false);
    }
  };

  const downloadQRCodeAsPDF = async () => {
    if (!qrCardRef.current || qrExporting) return;
    setQrExporting(true);
    setError("");
    try {
      const canvas = await captureElement(qrCardRef.current);
      saveCanvasAsPDF(canvas, `${safeFileName("qr-code")}.pdf`, 170, 240);
    } catch (err) {
      console.error("Error generating QR PDF:", err);
      setError("Impossible de générer le PDF du QR code. Réessayez.");
    } finally {
      setQrExporting(false);
    }
  };

  const printQRCode = async () => {
    if (!qrCardRef.current || qrExporting) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Veuillez autoriser les popups pour l'impression");
      return;
    }
    setQrExporting(true);
    setError("");
    try {
      const canvas = await captureElement(qrCardRef.current);
      printCanvas(canvas, `QR Code - ${restaurantName}`, printWindow);
    } catch (err) {
      printWindow.close();
      console.error("Error preparing QR code for print:", err);
      setError("Impossible de préparer le QR code pour l'impression. Réessayez.");
    } finally {
      setQrExporting(false);
    }
  };

  if (loading && !qrCode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f46e4b] mb-4"></div>
          <p className="text-gray-300">Génération de votre QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#2e283d" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">QR Code </h1>
        <p className="text-gray-300 mb-8">
          Vos clients scannent ce code pour accéder à leur carte de fidélité
        </p>

        {error && (
          <div className="bg-[#ffd9b9] text-[#e0682e] p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {qrCode && (
          <>
            {/* TOP ROW: Flyer + Standalone QR Code */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Left: Flyer Section */}
              <div className="space-y-6">
                {/* FLYER */}
                <div
                  ref={flyerRef}
                  className="flyer-card w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    background: "#f46e4b",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Top section: logo + name */}
                  <div style={{ padding: "1.2rem 1.5rem 0.8rem", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                      {restaurantLogo ? (
                        <div
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.9)",
                            padding: "4px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={restaurantLogo}
                            alt={restaurantName}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                            border: "2px solid rgba(255,255,255,0.5)",
                          }}
                        >
                          <StoreIcon />
                        </div>
                      )}
                    </div>

                    <h2
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: "800",
                        color: "#ffffff",
                        marginBottom: "0.2rem",
                        textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      {restaurantName}
                    </h2>

                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "3px",
                          background: "rgba(255,255,255,0.6)",
                          borderRadius: "9999px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: "center", padding: "0 1rem 0.2rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "2.8rem",
                        fontWeight: "900",
                        color: "#ffffff",
                        letterSpacing: "0.04em",
                        textShadow: "0 3px 12px rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.15)",
                      }}
                    >
                      SCAN TO WIN
                    </span>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      width: "360px",
                      height: "360px",
                      margin: "0 auto",
                    }}
                  >
                    <Image
                      src="/images/box.png"
                      alt="Gift Box"
                      width={370}
                      height={370}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        zIndex: 1,
                      }}
                      unoptimized
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginLeft: "-75px",
                        marginTop: "-75px",
                        width: "170px",
                        height: "170px",
                        zIndex: 2,
                      }}
                    >
                      <img
                        src={qrCode}
                        alt="QR Code"
                        width={170}
                        height={170}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>

                    {/* Keep the QR modules unobstructed so the printed code scans reliably. */}
                  </div>

                  <div style={{ textAlign: "center", padding: "0.25rem 1rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        color: "#ffffff",
                        padding: "0.3rem 1rem",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                      }}
                    >
                      SCANNEZ , GAGNEZ DES POINTS  &amp; RECEVEZ DES CADEAUX !
                    </span>
                  </div>
                </div>

                {/* Flyer buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={downloadPosterAsPNG}
                    disabled={flyerExporting}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#f46e4b] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DownloadIcon />
                    <span className="ml-2">PNG</span>
                  </button>
                  <button
                    onClick={downloadPosterAsPDF}
                    disabled={flyerExporting}
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

              {/* Right: Standalone QR Code Card (no text) */}
              <div className="space-y-6">
                <div
                  ref={qrCardRef}
                  className="qr-card w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
                  style={{ padding: "2rem" }}
                >
                  <div className="flex justify-center">
                    <div className="relative" style={{ width: "280px", margin: "0 auto" }}>
                      <img
                        src={qrCode}
                        alt="QR Code"
                        style={{
                          width: "100%",
                          maxWidth: "280px",
                          height: "auto",
                          display: "block",
                        }}
                      />
                      {/* Keep the original QR image unobstructed for reliable scanning. */}
                    </div>
                  </div>
                </div>

                {/* QR Code standalone buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={downloadQRCodeAsPNG}
                    disabled={qrExporting}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#f46e4b] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DownloadIcon />
                    <span className="ml-2">PNG</span>
                  </button>
                  <button
                    onClick={downloadQRCodeAsPDF}
                    disabled={qrExporting}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a75] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <PdfIcon />
                    <span className="ml-2">PDF</span>
                  </button>
                  <button
                    onClick={printQRCode}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#2d2d44] text-gray-200 rounded-lg hover:bg-[#3d3d5c] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <PrintIcon />
                    <span className="ml-2">Imprimer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: Instructions, URL, Stats */}
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
                      <div className="flex-shrink-0 w-6 h-6 bg-[#f46e4b]/20 text-[#f46e4b] rounded-full flex items-center justify-center text-sm font-bold">
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
                    className="px-4 py-2 bg-[#2d2d44] text-gray-300 rounded-lg hover:bg-[#f46e4b] hover:text-white flex items-center transition-colors"
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
                    className="text-[#f46e4b] hover:text-[#e0682e] text-sm font-medium inline-flex items-center transition-colors"
                  >
                    Voir mes clients →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}