
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Image from "next/image";

// ============================================================
// ICONS
// ============================================================

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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

// ============================================================
// MAIN COMPONENT
// ============================================================

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

  // ============================================================
  // FETCH DATA
  // ============================================================

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
        setError(data.error || "Impossible de générer le QR code.");
      }
    } catch {
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

  // ============================================================
  // COPY URL
  // ============================================================

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(restaurantUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Impossible de copier le lien.");
    }
  };

  // ============================================================
  // WAIT FOR IMAGES AND FONTS
  // ============================================================

  const waitForImages = async (element: HTMLElement): Promise<void> => {
    await document.fonts.ready;

    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(async (img) => {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            const finish = () => resolve();

            img.addEventListener("load", finish, { once: true });
            img.addEventListener("error", finish, { once: true });
          });
        }

        if (img.complete && img.naturalWidth > 0 && img.decode) {
          try {
            await img.decode();
          } catch {
            // Continue if decoding fails
          }
        }
      })
    );
  };

  // ============================================================
  // CAPTURE EXACT RENDERED ELEMENT
  // ============================================================

  const captureElement = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
    await waitForImages(element);

    // Wait until the browser finishes its layout and paint
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      throw new Error("Element has invalid dimensions.");
    }

    const canvas = await html2canvas(element, {
      scale: 3,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: false,

      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),

      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,

      imageTimeout: 15000,
      removeContainer: true,
    });

    return canvas;
  };

  // ============================================================
  // FILE NAME
  // ============================================================

  const getFileName = (prefix: string, extension: string) => {
    const safeName = restaurantName
      .trim()
      .replace(/[^a-zA-Z0-9À-ÿ_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${prefix}-${safeName || "restaurant"}.${extension}`;
  };

  // ============================================================
  // FLYER EXPORT: PNG
  // ============================================================

  const downloadPosterAsPNG = async () => {
    if (!flyerRef.current || flyerExporting) return;

    setFlyerExporting(true);
    setError("");

    try {
      const canvas = await captureElement(flyerRef.current);

      const link = document.createElement("a");

      link.download = getFileName("affiche", "png");
      link.href = canvas.toDataURL("image/png");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error generating flyer PNG:", err);
      setError("Impossible de générer l'image. Réessayez.");
    } finally {
      setFlyerExporting(false);
    }
  };

  // ============================================================
  // FLYER EXPORT: PDF
  // ============================================================

  const downloadPosterAsPDF = async () => {
    if (!flyerRef.current || flyerExporting) return;

    setFlyerExporting(true);
    setError("");

    try {
      const canvas = await captureElement(flyerRef.current);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 190;
      const pageHeight = 277;

      // Keep original image proportions
      const ratio = Math.min(
        pageWidth / canvas.width,
        pageHeight / canvas.height
      );

      const finalWidth = canvas.width * ratio;
      const finalHeight = canvas.height * ratio;

      const x = (210 - finalWidth) / 2;
      const y = (297 - finalHeight) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        x,
        y,
        finalWidth,
        finalHeight,
        undefined,
        "FAST"
      );

      pdf.save(getFileName("affiche", "pdf"));
    } catch (err) {
      console.error("Error generating flyer PDF:", err);
      setError("Impossible de générer le PDF. Réessayez.");
    } finally {
      setFlyerExporting(false);
    }
  };

  // ============================================================
  // QR CODE EXPORT: PNG
  // ============================================================

  const downloadQRCodeAsPNG = async () => {
    if (!qrCardRef.current || qrExporting) return;

    setQrExporting(true);
    setError("");

    try {
      const canvas = await captureElement(qrCardRef.current);

      const link = document.createElement("a");

      link.download = getFileName("qr-code", "png");
      link.href = canvas.toDataURL("image/png");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error generating QR PNG:", err);
      setError("Impossible de générer le QR code. Réessayez.");
    } finally {
      setQrExporting(false);
    }
  };

  // ============================================================
  // QR CODE EXPORT: PDF
  // ============================================================

  const downloadQRCodeAsPDF = async () => {
    if (!qrCardRef.current || qrExporting) return;

    setQrExporting(true);
    setError("");

    try {
      const canvas = await captureElement(qrCardRef.current);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const maxWidth = 170;
      const maxHeight = 250;

      const ratio = Math.min(
        maxWidth / canvas.width,
        maxHeight / canvas.height
      );

      const width = canvas.width * ratio;
      const height = canvas.height * ratio;

      const x = (210 - width) / 2;
      const y = (297 - height) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        x,
        y,
        width,
        height,
        undefined,
        "FAST"
      );

      pdf.save(getFileName("qr-code", "pdf"));
    } catch (err) {
      console.error("Error generating QR PDF:", err);
      setError("Impossible de générer le PDF du QR code. Réessayez.");
    } finally {
      setQrExporting(false);
    }
  };

  // ============================================================
  // PRINT: USE THE SAME RENDERED IMAGE AS THE DOWNLOAD
  // ============================================================

  const printElement = async (
    element: HTMLElement,
    title: string,
    background: string
  ) => {
    // Open synchronously to avoid popup blockers
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Veuillez autoriser les popups pour l'impression.");
      return;
    }

    try {
      const canvas = await captureElement(element);

      // Use the exact captured appearance
      const imageData = canvas.toDataURL("image/png");

      printWindow.document.open();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <title>${title.replace(/[<>&"]/g, "")}</title>

            <style>
              @page {
                size: auto;
                margin: 10mm;
              }

              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                min-height: 100%;
                background: ${background};
              }

              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
              }

              .print-container {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                width: 100%;
                padding: 0;
              }

              .print-image {
                display: block;
                width: auto;
                height: auto;
                max-width: 190mm;
                max-height: 277mm;
                object-fit: contain;
                margin: 0 auto;
              }

              @media print {
                html,
                body {
                  width: 100%;
                  height: auto;
                  min-height: 0;
                  background: ${background} !important;
                }

                .print-container {
                  padding: 0;
                  width: 100%;
                }

                .print-image {
                  max-width: 100%;
                  max-height: 277mm;
                }
              }
            </style>
          </head>

          <body>
            <div class="print-container">
              <img
                class="print-image"
                id="print-image"
                src="${imageData}"
                alt="${title.replace(/[<>&"]/g, "")}"
              />
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      const printImage = printWindow.document.getElementById(
        "print-image"
      ) as HTMLImageElement | null;

      if (!printImage) {
        throw new Error("Print image could not be created.");
      }

      // Wait for the image to be ready
      if (!printImage.complete) {
        await new Promise<void>((resolve, reject) => {
          printImage.onload = () => resolve();
          printImage.onerror = () =>
            reject(new Error("Failed to load print image."));
        });
      }

      if (printImage.decode) {
        try {
          await printImage.decode();
        } catch {
          // Continue if the image is already rendered
        }
      }

      printWindow.focus();

      // Give the print window time to render
      await new Promise<void>((resolve) => {
        printWindow.requestAnimationFrame(() => {
          printWindow.requestAnimationFrame(() => resolve());
        });
      });

      printWindow.onafterprint = () => {
        printWindow.close();
      };

      printWindow.print();
    } catch (err) {
      console.error("Print error:", err);

      if (!printWindow.closed) {
        printWindow.close();
      }

      setError("Impossible de préparer l'impression.");
    }
  };

  // ============================================================
  // PRINT FLYER
  // ============================================================

  const printPoster = () => {
    if (!flyerRef.current) return;

    printElement(
      flyerRef.current,
      `Affiche - ${restaurantName}`,
      "#f46e4b"
    );
  };

  // ============================================================
  // PRINT QR CODE
  // ============================================================

  const printQRCode = () => {
    if (!qrCardRef.current) return;

    printElement(
      qrCardRef.current,
      `QR Code - ${restaurantName}`,
      "#ffffff"
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading && !qrCode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f46e4b] mb-4"></div>
          <p className="text-gray-300">
            Génération de votre QR code...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "#2e283d" }}
    >
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-2">
          QR Code
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
          <>
            {/* ==================================================
                TOP ROW: FLYER + STANDALONE QR CODE
            ================================================== */}

            <div className="grid md:grid-cols-2 gap-8 mb-12">

              {/* ==================================================
                  LEFT: FLYER
              ================================================== */}

              <div className="space-y-6">

                <div
                  ref={flyerRef}
                  className="flyer-card w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    background: "#f46e4b",
                  }}
                >

                  {/* LOGO + RESTAURANT NAME */}

                  <div
                    style={{
                      padding: "1.2rem 1.5rem 0.8rem",
                      textAlign: "center",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "0.5rem",
                      }}
                    >

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
                            crossOrigin="anonymous"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
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

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
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

                  {/* SCAN TO WIN */}

                  <div
                    style={{
                      textAlign: "center",
                      padding: "0 1rem 0.2rem",
                    }}
                  >
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

                  {/* GIFT BOX + QR CODE */}

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
                      unoptimized
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        zIndex: 1,
                      }}
                    />

                    {/* QR CODE */}

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
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                        }}
                      />
                    </div>

                    {/* RESTAURANT LOGO INSIDE QR CODE */}

                    {restaurantLogo && (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "48px",
                          height: "48px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                          zIndex: 3,
                          border: "2px solid #ffffff",
                        }}
                      >
                        <img
                          src={restaurantLogo}
                          alt="Logo"
                          crossOrigin="anonymous"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                  </div>

                  {/* BOTTOM TEXT */}

                  <div
                    style={{
                      textAlign: "center",
                      padding: "0.25rem 1rem 1rem",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        color: "#ffffff",
                        padding: "0.3rem 1rem",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                      }}
                    >
                      SCANNEZ , GAGNEZ DES POINTS &amp; RECEVEZ DES CADEAUX !
                    </span>
                  </div>

                </div>

                {/* FLYER BUTTONS */}

                <div className="flex flex-wrap gap-3 justify-center">

                  <button
                    onClick={downloadPosterAsPNG}
                    disabled={flyerExporting}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#f46e4b] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {flyerExporting ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <DownloadIcon />
                        <span className="ml-2">PNG</span>
                      </>
                    )}
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

              {/* ==================================================
                  RIGHT: STANDALONE QR CODE
              ================================================== */}

              <div className="space-y-6">

                <div
                  ref={qrCardRef}
                  className="qr-card w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
                  style={{ padding: "2rem" }}
                >

                  <div className="flex justify-center">

                    <div
                      className="relative"
                      style={{
                        width: "280px",
                        margin: "0 auto",
                      }}
                    >

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

                      {restaurantLogo && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "64px",
                            height: "64px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            border: "2px solid #ffffff",
                          }}
                        >
                          <img
                            src={restaurantLogo}
                            alt="Logo"
                            crossOrigin="anonymous"
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {/* QR CODE BUTTONS */}

                <div className="flex flex-wrap gap-3 justify-center">

                  <button
                    onClick={downloadQRCodeAsPNG}
                    disabled={qrExporting}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#f46e4b] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {qrExporting ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <DownloadIcon />
                        <span className="ml-2">PNG</span>
                      </>
                    )}
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

            {/* ==================================================
                BOTTOM SECTION
            ================================================== */}

            <div className="space-y-6">

              {/* HOW TO USE */}

              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">

                <h2 className="text-xl font-semibold mb-4 text-white">
                  Comment utiliser ce QR code ?
                </h2>

                <div className="space-y-4">

                  {[
                    "Imprimez l'affiche ou le QR code – Placez-le sur vos tables, comptoir, ou vitrine",
                    "Client scanne le code – Avec l'appareil photo de son téléphone",
                    "Client entre son nom – Son compte est créé automatiquement",
                    "Carte de fidélité digitale – Le client accumule des tampons à chaque visite",
                  ].map((text, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-[#f46e4b]/20 text-[#f46e4b] rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>

                      <p className="text-gray-300 text-sm">
                        {text}
                      </p>
                    </div>
                  ))}

                </div>

              </div>

              {/* DIRECT URL + STATISTICS */}

              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg border border-[#2d2d44]">

                <h2 className="text-lg font-semibold mb-3 text-white">
                  Lien direct
                </h2>

                <div className="flex items-center space-x-2 mb-6">

                  <input
                    type="text"
                    value={restaurantUrl}
                    readOnly
                    className="flex-1 min-w-0 px-3 py-2 border border-[#2d2d44] rounded-lg bg-[#0f0f1a] text-sm text-white"
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

                {/* STATISTICS */}

                <div className="bg-[#ffd9b9] p-5 rounded-xl">

                  <h3 className="font-semibold text-[#e0682e] mb-2 flex items-center gap-2">
                    <span>📊</span>
                    Statistiques
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
