"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/generate-qr");
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setRestaurantUrl(data.url);
        setRestaurantName(data.restaurantName || "Mon Restaurant");
        setRestaurantLogo(data.restaurantLogo || null);
      } else {
        setError(data.error);
      }
    } catch {
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

  const handleDownloadPNG = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-${restaurantName}-${Date.now()}.png`;
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!qrCode) return;

    // Build a printable HTML page as a blob and open in new tab for Save as PDF
    const logoHtml = restaurantLogo
      ? `<img src="${restaurantLogo}" style="width:72px;height:72px;border-radius:50%;border:3px solid #F97316;object-fit:cover;" />`
      : `<div style="width:72px;height:72px;border-radius:50%;background:#271e36;border:3px solid #F97316;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#F97316;">${restaurantName.charAt(0)}</div>`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Affiche QR — ${restaurantName}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #2e283d; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .poster { background: #3d344d; border: 2px solid #4a3d5e; border-radius: 24px; padding: 36px 28px 28px; display: flex; flex-direction: column; align-items: center; width: 340px; }
  .bar { width: 48px; height: 5px; background: #F97316; border-radius: 99px; margin-bottom: 24px; }
  .logo-wrap { margin-bottom: 12px; }
  .name { font-size: 20px; font-weight: 700; color: #FAFAFA; margin-bottom: 8px; text-align: center; }
  .tagline { font-size: 13px; color: #94A3B8; text-align: center; line-height: 1.6; margin-bottom: 20px; max-width: 240px; }
  .qr-box { background: #fff; border-radius: 16px; padding: 14px; margin-bottom: 16px; }
  .qr-box img { width: 200px; height: 200px; display: block; }
  .scan-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: #F97316; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
  .footer { font-size: 11px; color: #4a3d5e; text-align: center; margin-top: 8px; }
  @media print { body { background: white; } .poster { border: 2px solid #ddd; } }
</style>
</head>
<body>
<div class="poster">
  <div class="bar"></div>
  <div class="logo-wrap">${logoHtml}</div>
  <p class="name">${restaurantName}</p>
  <p class="tagline">Scannez, collectez, gagnez des points.<br/>Votre carte de fidélité digitale.</p>
  <div class="qr-box"><img src="${qrCode}" alt="QR Code"/></div>
  <p class="scan-label">Scannez &amp; cumulez des points</p>
  <p class="footer">Powered by adam</p>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
          URL.revokeObjectURL(url);
        }, 500);
      };
    }
  };

  const handlePrint = () => {
    if (!qrCode) return;
    const win = window.open("", "_blank");
    if (!win) return;

    const logoHtml = restaurantLogo
      ? `<img src="${restaurantLogo}" style="width:72px;height:72px;border-radius:50%;border:3px solid #F97316;object-fit:cover;" />`
      : `<div style="width:72px;height:72px;border-radius:50%;background:#271e36;border:3px solid #F97316;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#F97316;">${restaurantName.charAt(0)}</div>`;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Affiche QR — ${restaurantName}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #2e283d; display: flex; align-items: center; justify-content: center; min-height: 100vh; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .poster { background: #3d344d; border: 2px solid #4a3d5e; border-radius: 24px; padding: 36px 28px 28px; display: flex; flex-direction: column; align-items: center; width: 340px; }
  .bar { width: 48px; height: 5px; background: #F97316; border-radius: 99px; margin-bottom: 24px; }
  .logo-wrap { margin-bottom: 12px; }
  .name { font-size: 20px; font-weight: 700; color: #FAFAFA; margin-bottom: 8px; text-align: center; }
  .tagline { font-size: 13px; color: #94A3B8; text-align: center; line-height: 1.6; margin-bottom: 20px; max-width: 240px; }
  .qr-box { background: #fff; border-radius: 16px; padding: 14px; margin-bottom: 16px; }
  .qr-box img { width: 200px; height: 200px; display: block; }
  .scan-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: #F97316; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
  .footer { font-size: 11px; color: #94A3B8; text-align: center; }
  @media print { @page { size: A4; margin: 1cm; } }
</style>
</head>
<body>
<div class="poster">
  <div class="bar"></div>
  <div class="logo-wrap">${logoHtml}</div>
  <p class="name">${restaurantName}</p>
  <p class="tagline">Scannez, collectez, gagnez des points.<br/>Votre carte de fidélité digitale.</p>
  <div class="qr-box"><img src="${qrCode}" alt="QR Code"/></div>
  <p class="scan-label">Scannez &amp; cumulez des points</p>
  <p class="footer">Powered by adam</p>
</div>
<script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 600); }<\/script>
</body>
</html>`);
    win.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
            style={{ borderColor: "#F97316" }}
          />
          <p style={{ color: "#94A3B8", fontFamily: "'Inter', sans-serif" }}>
            Génération de votre QR code...
          </p>
        </div>
      </div>
    );
  }

  // ── CSS variables as inline style map ──
  const C = {
    bgApp: "#2e283d",
    bgCard: "#3d344d",
    bgCardHover: "#483d5a",
    bgDeep: "#271e36",
    border: "#4a3d5e",
    borderLight: "rgba(255,255,255,0.1)",
    textMain: "#FAFAFA",
    textMuted: "#94A3B8",
    primary: "#F97316",
    primaryBg: "rgba(249,115,22,0.12)",
    primaryBorder: "rgba(249,115,22,0.3)",
    radiusLg: "24px",
    radiusMd: "14px",
  };

  return (
    <div
      className="max-w-5xl mx-auto py-8 px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Load Inter */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <h1
        className="text-3xl font-bold mb-1"
        style={{ color: C.textMain, letterSpacing: "-0.5px" }}
      >
        QR Code de votre restaurant
      </h1>
      <p className="mb-8 text-sm" style={{ color: C.textMuted }}>
        Vos clients scannent ce code pour accéder à leur carte de fidélité
      </p>

      {error && (
        <div
          className="p-4 rounded-xl mb-6 text-sm font-medium"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          {error}
        </div>
      )}

      {qrCode && (
        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Affiche ── */}
          <div
            className="flex flex-col items-center rounded-3xl p-7"
            style={{ background: C.bgCard, border: `1px solid ${C.border}` }}
          >
            {/* Decorative top bar */}
            <div
              className="rounded-full mb-6"
              style={{ width: "48px", height: "5px", background: C.primary }}
            />

            {/* Logo */}
            <div className="mb-3">
              {restaurantLogo ? (
                <Image
                  src={restaurantLogo}
                  alt={restaurantName}
                  width={72}
                  height={72}
                  className="rounded-full object-cover"
                  style={{ border: `3px solid ${C.primary}` }}
                />
              ) : (
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: C.bgDeep, border: `3px solid ${C.primary}`, color: C.primary }}
                >
                  {restaurantName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Restaurant name */}
            <p
              className="text-lg font-bold text-center mb-2"
              style={{ color: C.textMain, letterSpacing: "-0.3px" }}
            >
              {restaurantName}
            </p>

            {/* Tagline */}
            <p
              className="text-xs text-center mb-5 leading-relaxed max-w-[200px]"
              style={{ color: C.textMuted }}
            >
              Scannez, collectez, gagnez des points.{" "}
              <span style={{ color: C.primary, fontWeight: 600 }}>
                Votre carte de fidélité digitale.
              </span>
            </p>

            {/* QR Code box */}
            <div
              className="rounded-2xl p-3 mb-4"
              style={{ background: "#ffffff" }}
            >
              <Image
                src={qrCode}
                alt="QR Code"
                width={200}
                height={200}
                className="block"
              />
            </div>

            {/* Scan label */}
            <p
              className="text-[11px] font-bold tracking-[0.14em] uppercase text-center mb-5"
              style={{ color: C.primary }}
            >
              Scannez &amp; cumulez des points
            </p>

            {/* Download / Print buttons */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all active:scale-95"
                style={{
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  color: C.textMuted,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bgCardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.bgDeep)}
              >
                <svg className="w-5 h-5" fill="none" stroke={C.primary} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="text-[11px] font-medium" style={{ color: C.textMuted }}>Imprimer</span>
              </button>

              {/* PNG */}
              <button
                onClick={handleDownloadPNG}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all active:scale-95"
                style={{
                  background: C.bgDeep,
                  border: `1px solid ${C.border}`,
                  color: C.textMuted,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bgCardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.bgDeep)}
              >
                <svg className="w-5 h-5" fill="none" stroke={C.primary} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-[11px] font-medium" style={{ color: C.textMuted }}>PNG</span>
              </button>

              {/* PDF */}
              <button
                onClick={handleDownloadPDF}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all active:scale-95"
                style={{
                  background: C.primaryBg,
                  border: `1px solid ${C.primaryBorder}`,
                  color: C.primary,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(249,115,22,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.primaryBg)}
              >
                <svg className="w-5 h-5" fill="none" stroke={C.primary} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6" />
                </svg>
                <span className="text-[11px] font-semibold" style={{ color: C.primary }}>PDF</span>
              </button>
            </div>

            {/* Regenerate */}
            <button
              onClick={generateQRCode}
              className="w-full mt-3 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{ border: `1px solid ${C.border}`, color: C.textMuted, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bgCardHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Régénérer le QR code
            </button>
          </div>

          {/* ── RIGHT: Instructions + URL + Stats ── */}
          <div className="space-y-5">

            {/* How-to */}
            <div
              className="rounded-3xl p-6"
              style={{ background: C.bgCard, border: `1px solid ${C.border}` }}
            >
              <h2 className="text-base font-semibold mb-5" style={{ color: C.textMain }}>
                Comment utiliser ce QR code ?
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Imprimez le QR code", sub: "Placez-le sur vos tables, comptoir, ou vitrine" },
                  { label: "Client scanne le code", sub: "Avec l'appareil photo de son téléphone" },
                  { label: "Client entre son nom", sub: "Son compte est créé automatiquement" },
                  { label: "Carte de fidélité digitale", sub: "Il accumule des points à chaque visite" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: C.primaryBg, border: `1px solid ${C.primaryBorder}`, color: C.primary }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: C.textMain }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct URL */}
            <div
              className="rounded-3xl p-5"
              style={{ background: C.bgCard, border: `1px solid ${C.border}` }}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: C.textMain }}>Lien direct</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={restaurantUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs rounded-xl outline-none"
                  style={{
                    background: C.bgDeep,
                    border: `1px solid ${C.border}`,
                    color: C.textMuted,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: copied ? "rgba(16,185,129,0.15)" : C.primaryBg,
                    border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : C.primaryBorder}`,
                    color: copied ? "#10B981" : C.primary,
                  }}
                >
                  {copied ? "✓ Copié" : "Copier"}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div
              className="rounded-3xl p-5"
              style={{ background: C.primaryBg, border: `1px solid ${C.primaryBorder}` }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: C.primary }}>
                Statistiques
              </h3>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: C.textMuted }}>
                Suivez le nombre de clients qui scannent votre QR code et rejoignent votre programme.
              </p>
              <Link
                href="/dashboard/clients"
                className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ color: C.primary }}
              >
                Voir mes clients
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}