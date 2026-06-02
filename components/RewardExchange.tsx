"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

// ─── Add Points Modal ────────────────────────────────────────────────
function AddPointsModal({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("");
  const [stars, setStars] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scanning, setScanning] = useState(false);
  const [inputMode, setInputMode] = useState<"type" | "scan">("type");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = "add-points-qr-reader";

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (inputMode === "scan" && scanning) {
      setTimeout(async () => {
        html5QrCodeRef.current = new Html5Qrcode(containerId);
        try {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 30, qrbox: { width: 200, height: 200 } },
            (decodedText) => {
              let id = decodedText;
              const match = decodedText.match(/\/scan\/([^\/?#]+)/);
              if (match) id = match[1];
              setClientId(id);
              setInputMode("type");
              setScanning(false);
              stopScanner();
            },
            () => {}
          );
        } catch {
          setError("Impossible d'accéder à la caméra.");
          setScanning(false);
        }
      }, 100);
    } else if (inputMode !== "scan") {
      stopScanner();
    }
  }, [inputMode, scanning]);

  const handleSubmit = async () => {
    let rawId = clientId.trim();
    if (!rawId) { setError("Veuillez entrer un ID client"); return; }
    if (stars < 1) { setError("Choisissez au moins 1 étoile"); return; }
    if (rawId.startsWith("#")) rawId = rawId.slice(1);
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // 1. Resolve client
      const res = await fetch(`/api/customer/by-id/${encodeURIComponent(rawId)}`);
      const data = await res.json();
      if (!res.ok || !data.customer?.customerId) {
        setError(data.error || "Client non trouvé");
        setLoading(false);
        return;
      }
      const customerId = data.customer.customerId;
      // 2. Add points
      const addRes = await fetch(`/api/customer/${customerId}/add-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: stars }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || "Erreur lors de l'ajout des points");
        setLoading(false);
        return;
      }
      setSuccess(`✅ ${stars} étoile${stars > 1 ? "s" : ""} ajoutée${stars > 1 ? "s" : ""} avec succès !`);
      setClientId("");
      setStars(1);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) { stopScanner(); onClose(); } }}
    >
      <div style={{
        background: "#0d1f3c",
        border: "1px solid #1e3a5f",
        borderRadius: "1rem",
        padding: "1.75rem",
        width: "100%",
        maxWidth: "460px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        position: "relative",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.4rem" }}>⭐</span>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: 600 }}>
              Ajouter des Points
            </h2>
          </div>
          <button
            onClick={() => { stopScanner(); onClose(); }}
            style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1 }}
            aria-label="Fermer"
          >×</button>
        </div>

        {/* Step 1: Client ID */}
        <p style={{ color: "#9ca3af", fontSize: "0.78rem", marginBottom: "0.4rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          1. ID Client
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <button
            onClick={() => { setInputMode("type"); setScanning(false); setError(""); }}
            style={{
              flex: 1, padding: "0.45rem", borderRadius: "0.4rem", fontSize: "0.82rem", fontWeight: 500,
              border: "none", cursor: "pointer",
              background: inputMode === "type" ? "#fe5502" : "#1e3a5f",
              color: inputMode === "type" ? "#fff" : "#9ca3af",
            }}
          >✏️ Saisir</button>
          <button
            onClick={() => { setInputMode("scan"); setScanning(true); setError(""); }}
            style={{
              flex: 1, padding: "0.45rem", borderRadius: "0.4rem", fontSize: "0.82rem", fontWeight: 500,
              border: "none", cursor: "pointer",
              background: inputMode === "scan" ? "#fe5502" : "#1e3a5f",
              color: inputMode === "scan" ? "#fff" : "#9ca3af",
            }}
          >📷 Scanner</button>
        </div>

        {inputMode === "type" && (
          <input
            type="text"
            placeholder="Ex: CUST-123456-ABC ou 9A3F"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            style={{
              width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.4rem",
              background: "#1e3a5f", border: "1px solid #2a4a7a",
              color: "#fff", fontSize: "0.9rem", boxSizing: "border-box",
              outline: "none",
            }}
          />
        )}

        {inputMode === "scan" && scanning && (
          <div>
            <div id={containerId} style={{ overflow: "hidden", borderRadius: "0.5rem", background: "#000", minHeight: "220px", width: "100%" }} />
            <p style={{ color: "#6b7280", fontSize: "0.75rem", textAlign: "center", marginTop: "0.4rem" }}>
              Placez le QR code dans le cadre
            </p>
          </div>
        )}

        {clientId && inputMode === "type" && (
          <p style={{ color: "#34d399", fontSize: "0.77rem", marginTop: "0.35rem" }}>
            ✔ ID saisi : <strong style={{ color: "#fff" }}>{clientId}</strong>
          </p>
        )}

        {/* Step 2: Stars */}
        <p style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: "1rem", marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          2. Nombre d'étoiles
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => setStars(n)}
              style={{
                width: "2.5rem", height: "2.5rem", borderRadius: "0.4rem",
                border: stars >= n ? "2px solid #fe5502" : "1px solid #2a4a7a",
                background: stars >= n ? "rgba(254,85,2,0.15)" : "#1e3a5f",
                color: stars >= n ? "#fe5502" : "#9ca3af",
                fontSize: "1rem", cursor: "pointer", fontWeight: 600,
                transition: "all 0.15s",
              }}
            >★</button>
          ))}
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
          {stars} étoile{stars > 1 ? "s" : ""} sélectionnée{stars > 1 ? "s" : ""}
        </p>

        {/* Feedback */}
        {error && <p style={{ color: "#f87171", fontSize: "0.82rem", marginTop: "0.5rem" }}>{error}</p>}
        {success && <p style={{ color: "#34d399", fontSize: "0.82rem", marginTop: "0.5rem" }}>{success}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", marginTop: "1.25rem", padding: "0.7rem",
            borderRadius: "0.5rem", border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#555" : "#fe5502",
            color: "#fff", fontWeight: 600, fontSize: "0.95rem",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Envoi en cours…" : `⭐ Valider et envoyer ${stars} étoile${stars > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ onAddPoints }: { onAddPoints: () => void }) {
  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "#091629",
      borderRight: "1px solid #1e3a5f",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 0",
      gap: "0.25rem",
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 1rem 1.5rem", borderBottom: "1px solid #1e3a5f" }}>
        <span style={{ fontSize: "1.5rem" }}>🏅</span>
        <p style={{ color: "#fe5502", fontWeight: 700, fontSize: "0.85rem", margin: "0.25rem 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Fidélité Pro
        </p>
      </div>

      <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {/* Add Points — highlighted */}
        <button
          onClick={onAddPoints}
          style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.65rem 0.85rem", borderRadius: "0.5rem",
            background: "rgba(254,85,2,0.12)", border: "1px solid rgba(254,85,2,0.3)",
            color: "#fe5502", fontWeight: 600, fontSize: "0.88rem",
            cursor: "pointer", textAlign: "left", width: "100%",
            transition: "background 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Ajouter des Points
        </button>

        {/* Other nav items */}
        {[
          { icon: "👥", label: "Clients" },
          { icon: "🎁", label: "Récompenses" },
          { icon: "📊", label: "Statistiques" },
          { icon: "⚙️", label: "Paramètres" },
        ].map((item) => (
          <button
            key={item.label}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.65rem 0.85rem", borderRadius: "0.5rem",
              background: "transparent", border: "1px solid transparent",
              color: "#9ca3af", fontWeight: 500, fontSize: "0.88rem",
              cursor: "pointer", textAlign: "left", width: "100%",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#1e3a5f";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
            }}
          >
            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────
export default function RewardExchange() {
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  const startScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }
    html5QrCodeRef.current = new Html5Qrcode(containerId);
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 30, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          let customerId = decodedText;
          const scanMatch = decodedText.match(/\/scan\/([^\/?#]+)/);
          if (scanMatch) customerId = scanMatch[1];
          window.location.href = `/scan/${customerId}`;
        },
        (errorMessage) => {
          if (errorMessage && !errorMessage.includes("NoMultiCode") && !errorMessage.includes("No QR")) {
            console.warn(errorMessage);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }
  };

  useEffect(() => {
    if (mode === "scan" && scanning) {
      setTimeout(() => { startScanner(); }, 100);
    } else if (mode !== "scan") {
      stopScanner();
    }
  }, [mode, scanning]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let rawInput = customerIdInput.trim();
    if (!rawInput) { setError("Veuillez entrer un numéro de carte"); return; }
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
    <>
      {/* ── Full-page layout ── */}
      <div style={{ display: "flex", minHeight: "100vh", background: "#07111f" }}>
        {/* Sidebar */}
        <Sidebar onAddPoints={() => setShowAddPoints(true)} />

        {/* Main content */}
        <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>

          {/* Dashboard header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
              Tableau de bord
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: "0.35rem" }}>
              Bienvenue sur votre tableau de bord de fidélité
            </p>
          </div>

          {/* Exchange card */}
          <div style={{ maxWidth: "480px" }}>
            <div
              style={{
                background: "#0d1f3c",
                borderRadius: "1rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                border: "1px solid rgba(30,58,95,0.4)",
                padding: "1.5rem",
                transition: "all 0.3s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🎁</span>
                <h2 style={{ margin: 0, color: "#fff", fontSize: "1.15rem", fontWeight: 600 }}>
                  Échanger une récompense
                </h2>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1rem" }}>
                Scannez la carte du client ou saisissez son numéro
              </p>

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <button
                  onClick={() => { setMode("scan"); setScanning(true); setError(""); }}
                  style={{
                    flex: 1, padding: "0.5rem", borderRadius: "0.4rem",
                    fontSize: "0.85rem", fontWeight: 500, border: "none", cursor: "pointer",
                    background: mode === "scan" ? "#fe5502" : "#1e3a5f",
                    color: mode === "scan" ? "#fff" : "#9ca3af",
                    transition: "all 0.2s",
                  }}
                >📷 Scanner</button>
                <button
                  onClick={() => { setMode("manual"); setScanning(false); setError(""); }}
                  style={{
                    flex: 1, padding: "0.5rem", borderRadius: "0.4rem",
                    fontSize: "0.85rem", fontWeight: 500, border: "none", cursor: "pointer",
                    background: mode === "manual" ? "#fe5502" : "#1e3a5f",
                    color: mode === "manual" ? "#fff" : "#9ca3af",
                    transition: "all 0.2s",
                  }}
                >✏️ Saisir le numéro</button>
              </div>

              {mode === "scan" && scanning && (
                <div style={{ marginBottom: "1rem" }}>
                  <div id={containerId} style={{ overflow: "hidden", borderRadius: "0.5rem", background: "#000", minHeight: "300px", width: "100%" }} />
                  {error && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.5rem" }}>{error}</p>}
                  <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.5rem", textAlign: "center" }}>
                    Placez le QR code bien éclairé dans le cadre.
                  </p>
                </div>
              )}

              {mode === "manual" && (
                <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="Ex: CUST-123456-ABC ou 9A3F"
                    value={customerIdInput}
                    onChange={(e) => setCustomerIdInput(e.target.value)}
                    style={{
                      width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.4rem",
                      background: "#1e3a5f", border: "1px solid #2a4a7a",
                      color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <p style={{ color: "#6b7280", fontSize: "0.75rem", margin: 0 }}>
                    Saisissez le code complet ou les 4 derniers caractères (ex: #9A3F → saisir 9A3F).
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "0.6rem", background: loading ? "#555" : "#fe5502",
                      color: "#fff", border: "none", borderRadius: "0.4rem",
                      fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    {loading ? "Recherche…" : "Détecter"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Add Points Modal ── */}
      {showAddPoints && <AddPointsModal onClose={() => setShowAddPoints(false)} />}
    </>
  );
}