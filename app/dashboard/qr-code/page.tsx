"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Canvas rendering                                                    */
/*                                                                     */
/* The flyer and the QR card are drawn ONCE on a canvas. The preview,  */
/* the PNG, the PDF and the print all use that exact same image, so    */
/* what you see is exactly what you download / print. The QR code is   */
/* drawn without smoothing, so it stays sharp and scannable.           */
/* ------------------------------------------------------------------ */
const SCALE = 3; // export quality (3x)

const FLYER_W = 448;
const FLYER_H = 690;
const QR_CARD_SIZE = 344;

const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Fine-tune the QR position inside the gift box (in px, on the 448px-wide flyer).
// Negative Y = move up, positive Y = move down. Negative X = left, positive X = right.
const QR_OFFSET_X = 0;
const QR_OFFSET_Y = 20;

// Bounding box of the non-transparent pixels of an image (natural coordinates)
const getOpaqueBounds = (img: HTMLImageElement) => {
  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 40) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) return null;
    return { minX, minY, maxX, maxY };
  } catch {
    return null;
  }
};

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Draw an image inside a circle (object-fit: cover)
const drawCircleImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number
) => {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
};

// Redraw the QR code module by module, with every module an exact whole
// number of pixels. This keeps all lines perfectly even and sharp (no
// stretching / blurring), so the code scans the same on screen, in the
// PNG, in the PDF and on paper.
// Returns the drawn size in logical units.
const drawQR = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  sizeLogical: number,
  scale: number
): number => {
  const fallback = () => {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, cx - sizeLogical / 2, cy - sizeLogical / 2, sizeLogical, sizeLogical);
    ctx.restore();
    return sizeLogical;
  };

  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h).data;
    const dark = (x: number, y: number) => {
      const i = (y * w + x) * 4;
      return d[i + 3] > 128 && (d[i] + d[i + 1] + d[i + 2]) / 3 < 128;
    };

    // Bounding box of the dark modules
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (dark(x, y)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return fallback();

    // Top-left finder pattern = 7 modules wide -> module size in source pixels
    let x = minX;
    while (x < w && dark(x, minY)) x++;
    const m = (x - minX) / 7;
    const n = Math.round((maxX - minX + 1) / m);
    if (m < 1 || n < 21 || n > 177 || (n - 21) % 4 !== 0) return fallback();

    // Draw in device pixels with an integer module size
    const mp = Math.max(1, Math.floor((sizeLogical * scale) / n));
    const total = mp * n;
    const x0 = Math.round(cx * scale - total / 2);
    const y0 = Math.round(cy * scale - total / 2);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < n; r++) {
      for (let col = 0; col < n; col++) {
        const sx = Math.min(w - 1, Math.round(minX + (col + 0.5) * m));
        const sy = Math.min(h - 1, Math.round(minY + (r + 0.5) * m));
        if (dark(sx, sy)) {
          ctx.fillRect(x0 + col * mp, y0 + r * mp, mp, mp);
        }
      }
    }
    ctx.restore();
    return total / scale;
  } catch {
    return fallback();
  }
};

// Reduce font size until the text fits maxWidth
const fitFont = (
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  startSize: number,
  maxWidth: number
) => {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  while (ctx.measureText(text).width > maxWidth && size > 8) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  }
  return size;
};

const setLetterSpacing = (ctx: CanvasRenderingContext2D, value: string) => {
  // Supported by modern browsers; ignored silently otherwise
  (ctx as unknown as { letterSpacing: string }).letterSpacing = value;
};

const renderFlyer = async (
  qrSrc: string,
  logoSrc: string | null,
  name: string,
  SCALE: number = 3
): Promise<string> => {
  const canvas = document.createElement("canvas");
  canvas.width = FLYER_W * SCALE;
  canvas.height = FLYER_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const [qr, logo, box] = await Promise.all([
    loadImage(qrSrc),
    logoSrc ? loadImage(logoSrc) : Promise.resolve(null),
    loadImage("/images/box.png"),
  ]);

  const cx = FLYER_W / 2;

  // Background (rounded card)
  ctx.save();
  roundRectPath(ctx, 0, 0, FLYER_W, FLYER_H, 24);
  ctx.clip();
  ctx.fillStyle = "#f46e4b";
  ctx.fillRect(0, 0, FLYER_W, FLYER_H);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // --- Logo -----------------------------------------------------------
  const logoCy = 76;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 20 * SCALE;
  ctx.shadowOffsetY = 6 * SCALE;
  ctx.fillStyle = logo ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.arc(cx, logoCy, 37, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (logo) {
    drawCircleImage(ctx, logo, cx, logoCy, 33);
  } else {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, logoCy, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 32px ${FONT_STACK}`;
    ctx.fillText((name.trim()[0] || "R").toUpperCase(), cx, logoCy + 1);
  }

  // --- Restaurant name --------------------------------------------------
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 8 * SCALE;
  ctx.shadowOffsetY = 2 * SCALE;
  fitFont(ctx, name, 800, 24, 390);
  ctx.fillText(name, cx, 146);
  ctx.restore();

  // --- Small divider line ----------------------------------------------
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  roundRectPath(ctx, cx - 20, 172, 40, 3, 1.5);
  ctx.fill();

  // --- SCAN TO WIN ------------------------------------------------------
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 12 * SCALE;
  ctx.shadowOffsetY = 3 * SCALE;
  setLetterSpacing(ctx, "2px");
  fitFont(ctx, "SCAN TO WIN", 900, 46, 400);
  ctx.fillText("SCAN TO WIN", cx, 222);
  ctx.restore();

  // --- Gift box + QR ----------------------------------------------------
  const boxSize = 360;
  const boxX = cx - boxSize / 2;
  const boxY = 268;

  // Default: centre of the 360x360 area
  let qrCx = cx + QR_OFFSET_X;
  let qrCy = boxY + boxSize / 2 + QR_OFFSET_Y;

  if (box) {
    // Keep the image proportions (object-fit: contain), centred in the area
    const ratio = Math.min(boxSize / box.naturalWidth, boxSize / box.naturalHeight);
    const dw = box.naturalWidth * ratio;
    const dh = box.naturalHeight * ratio;
    const dx = boxX + (boxSize - dw) / 2;
    const dy = boxY + (boxSize - dh) / 2;
    ctx.drawImage(box, dx, dy, dw, dh);

    // Centre the QR on the visible part of the box (ignores transparent margins)
    const b = getOpaqueBounds(box);
    if (b) {
      qrCx = dx + ((b.minX + b.maxX) / 2) * ratio + QR_OFFSET_X;
      qrCy = dy + ((b.minY + b.maxY) / 2) * ratio + QR_OFFSET_Y;
    }
  }

  // White backing plate with a proper quiet zone (>= 4 modules) around the code
  const plate = 190;
  ctx.fillStyle = "#ffffff";
  roundRectPath(ctx, qrCx - plate / 2, qrCy - plate / 2, plate, plate, 8);
  ctx.fill();

  if (qr) {
    drawQR(ctx, qr, qrCx, qrCy, 142, SCALE);
  }

  if (logo && qr) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 8 * SCALE;
    ctx.shadowOffsetY = 2 * SCALE;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(qrCx, qrCy, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawCircleImage(ctx, logo, qrCx, qrCy, 17.5);
  }

  // --- Footer text --------------------------------------------------------
  ctx.fillStyle = "#ffffff";
  setLetterSpacing(ctx, "0px");
  const footer = "SCANNEZ, GAGNEZ DES POINTS & RECEVEZ DES CADEAUX !";
  fitFont(ctx, footer, 600, 13, 410);
  ctx.fillText(footer, cx, 654);

  return canvas.toDataURL("image/png");
};

const renderQRCard = async (
  qrSrc: string,
  logoSrc: string | null,
  SCALE: number = 3
): Promise<string> => {
  const canvas = document.createElement("canvas");
  canvas.width = QR_CARD_SIZE * SCALE;
  canvas.height = QR_CARD_SIZE * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const [qr, logo] = await Promise.all([
    loadImage(qrSrc),
    logoSrc ? loadImage(logoSrc) : Promise.resolve(null),
  ]);

  ctx.fillStyle = "#ffffff";
  roundRectPath(ctx, 0, 0, QR_CARD_SIZE, QR_CARD_SIZE, 24);
  ctx.fill();

  const c = QR_CARD_SIZE / 2;
  if (qr) drawQR(ctx, qr, c, c, 250, SCALE);

  if (logo && qr) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 12 * SCALE;
    ctx.shadowOffsetY = 4 * SCALE;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(c, c, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawCircleImage(ctx, logo, c, c, 25);
  }

  return canvas.toDataURL("image/png");
};

/* ------------------------------------------------------------------ */
/* Export helpers (all use the same rendered image)                    */
/* ------------------------------------------------------------------ */
const safeName = (s: string) => s.trim().replace(/\s+/g, "-");

const downloadPNG = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

const downloadPDF = (
  dataUrl: string,
  aspect: number, // width / height
  maxW: number, // mm
  maxH: number, // mm
  filename: string
) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  const x = (210 - w) / 2;
  const y = (297 - h) / 2;
  pdf.addImage(dataUrl, "PNG", x, y, w, h);
  pdf.save(filename);
};

const printImage = (
  dataUrl: string,
  title: string,
  maxWidthMm: number,
  maxHeightMm: number,
  onBlocked: () => void
) => {
  const w = window.open("", "_blank");
  if (!w) {
    onBlocked();
    return;
  }
  w.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <style>
      @page { size: A4; margin: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        width: 210mm; height: 297mm;
        display: flex; align-items: center; justify-content: center;
      }
      img {
        display: block;
        max-width: ${maxWidthMm}mm;
        max-height: ${maxHeightMm}mm;
        width: auto; height: auto;
      }
    </style>
  </head>
  <body>
    <img id="i" src="${dataUrl}" />
    <script>
      var img = document.getElementById('i');
      var go = function () { window.focus(); window.print(); };
      if (img.complete) { go(); } else { img.onload = go; }
      window.onafterprint = function () { window.close(); };
    </script>
  </body>
</html>`);
  w.document.close();
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const [flyerImg, setFlyerImg] = useState<string | null>(null);
  const [qrCardImg, setQrCardImg] = useState<string | null>(null);
  // Extra high-resolution versions used for PDF and printing
  const [flyerHi, setFlyerHi] = useState<string | null>(null);
  const [qrCardHi, setQrCardHi] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
    fetchRestaurantInfo();
  }, []);

  // Render flyer + QR card once data is ready
  useEffect(() => {
    if (!qrCode || !infoLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const [flyer, card] = await Promise.all([
          renderFlyer(qrCode, restaurantLogo, restaurantName || "Mon Restaurant"),
          renderQRCard(qrCode, restaurantLogo),
        ]);
        if (!cancelled) {
          setFlyerImg(flyer);
          setQrCardImg(card);
        }
        const [flyerH, cardH] = await Promise.all([
          renderFlyer(qrCode, restaurantLogo, restaurantName || "Mon Restaurant", 6),
          renderQRCard(qrCode, restaurantLogo, 6),
        ]);
        if (!cancelled) {
          setFlyerHi(flyerH);
          setQrCardHi(cardH);
        }
      } catch (err) {
        console.error("Render error:", err);
        if (!cancelled) setError("Impossible de générer l'affiche. Réessayez.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qrCode, restaurantLogo, restaurantName, infoLoaded]);

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
    } finally {
      setInfoLoaded(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(restaurantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const popupBlocked = () =>
    setError("Veuillez autoriser les popups pour l'impression");

  // Flyer actions
  const flyerPNG = () =>
    flyerImg && downloadPNG(flyerImg, `affiche-${safeName(restaurantName)}.png`);
  const flyerPDF = () => {
    const src = flyerHi || flyerImg;
    if (src)
      downloadPDF(
        src,
        FLYER_W / FLYER_H,
        190,
        277,
        `affiche-${safeName(restaurantName)}.pdf`
      );
  };
  const flyerPrint = () => {
    const src = flyerHi || flyerImg;
    if (src) printImage(src, `Affiche - ${restaurantName}`, 170, 260, popupBlocked);
  };

  // QR actions
  const qrPNG = () =>
    qrCardImg &&
    downloadPNG(qrCardImg, `qr-code-${safeName(restaurantName)}.png`);
  const qrPDF = () => {
    const src = qrCardHi || qrCardImg;
    if (src) downloadPDF(src, 1, 150, 150, `qr-code-${safeName(restaurantName)}.pdf`);
  };
  const qrPrint = () => {
    const src = qrCardHi || qrCardImg;
    if (src) printImage(src, `QR Code - ${restaurantName}`, 120, 120, popupBlocked);
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

  const ready = !!flyerImg && !!qrCardImg;

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
              {/* Left: Flyer */}
              <div className="space-y-6">
                <div className="w-full max-w-md mx-auto">
                  {flyerImg ? (
                    // The preview IS the exported image
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={flyerImg}
                      alt="Affiche"
                      className="w-full h-auto rounded-2xl shadow-2xl"
                      style={{ display: "block" }}
                    />
                  ) : (
                    <div
                      className="w-full rounded-2xl flex items-center justify-center"
                      style={{
                        aspectRatio: `${FLYER_W} / ${FLYER_H}`,
                        background: "rgba(244,110,75,0.25)",
                      }}
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f46e4b]"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={flyerPNG}
                    disabled={!ready}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#f46e4b] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DownloadIcon />
                    <span className="ml-2">PNG</span>
                  </button>
                  <button
                    onClick={flyerPDF}
                    disabled={!ready}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a75] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <PdfIcon />
                    <span className="ml-2">PDF</span>
                  </button>
                  <button
                    onClick={flyerPrint}
                    disabled={!ready}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#2d2d44] text-gray-200 rounded-lg hover:bg-[#3d3d5c] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <PrintIcon />
                    <span className="ml-2">Imprimer</span>
                  </button>
                </div>
              </div>

              {/* Right: Standalone QR Code */}
              <div className="space-y-6">
                <div className="w-full max-w-md mx-auto">
                  {qrCardImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCardImg}
                      alt="QR Code"
                      className="w-full h-auto rounded-2xl shadow-xl"
                      style={{ display: "block" }}
                    />
                  ) : (
                    <div
                      className="w-full rounded-2xl bg-white/10 flex items-center justify-center"
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f46e4b]"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={qrPNG}
                    disabled={!ready}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#f46e4b] text-white rounded-lg hover:bg-[#e0682e] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DownloadIcon />
                    <span className="ml-2">PNG</span>
                  </button>
                  <button
                    onClick={qrPDF}
                    disabled={!ready}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a75] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <PdfIcon />
                    <span className="ml-2">PDF</span>
                  </button>
                  <button
                    onClick={qrPrint}
                    disabled={!ready}
                    className="flex-1 min-w-[100px] px-4 py-2.5 bg-[#2d2d44] text-gray-200 rounded-lg hover:bg-[#3d3d5c] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
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