"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

// ─── Add Points Modal (updated: "add stars") ──────────────────────────
function AddPointsModal({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("");
  const [stars, setStars] = useState("");        // renamed from montant
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    const rawId = clientId.trim().replace(/^#/, "");
    if (!rawId) { setError("Veuillez entrer un ID client"); return; }
    if (!stars || isNaN(Number(stars)) || Number(stars) <= 0) {
      setError("Veuillez entrer un nombre d'étoiles valide");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/customer/by-id/${encodeURIComponent(rawId)}`);
      const data = await res.json();
      if (!res.ok || !data.customer?.customerId) {
        setError(data.error || "Client non trouvé");
        setLoading(false);
        return;
      }
      const customerId = data.customer.customerId;
      // Send the number of stars (points) to your API
      const addRes = await fetch(`/api/customer/${customerId}/add-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant: Number(stars) }), // or { points: Number(stars) } if your backend expects that
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || "Erreur lors de l'ajout des points");
        setLoading(false);
        return;
      }
      setSuccess(`✅ ${stars} étoile(s) ajoutée(s) avec succès pour ${rawId} !`);
      setClientId("");
      setStars("");
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{
        background: "#2d2b4e",
        borderRadius: "1.25rem",
        padding: "2rem",
        width: "100%",
        maxWidth: "520px",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.4rem", fontWeight: 700 }}>
            Ajouter des Points
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#9ca3af",
              cursor: "pointer", fontSize: "1.6rem", lineHeight: 1,
              padding: "0 0.25rem",
            }}
            aria-label="Fermer"
          >×</button>
        </div>

        <label style={{ color: "#e5e7eb", fontSize: "0.95rem", fontWeight: 500, display: "block", marginBottom: "0.6rem" }}>
          1. ID Client (Scanner ou Taper manuellement) *
        </label>
        <input
          type="text"
          placeholder="Ex: CLI_ADEM_9514"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          style={{
            width: "100%",
            padding: "1rem 1.1rem",
            borderRadius: "0.75rem",
            background: "#3d3b5e",
            border: "2px solid #5b5aff",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "1.25rem",
          }}
        />

        <label style={{ color: "#e5e7eb", fontSize: "0.95rem", fontWeight: 500, display: "block", marginBottom: "0.6rem" }}>
          2. Nombre d'étoiles / points *
        </label>
        <input
          type="number"
          placeholder="Ex: 10"
          value={stars}
          onChange={(e) => setStars(e.target.value)}
          step="1"
          min="0"
          style={{
            width: "100%",
            padding: "1rem 1.1rem",
            borderRadius: "0.75rem",
            background: "#3d3b5e",
            border: "1.5px solid #4a4870",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "0.75rem",
          }}
        />

        {error && (
          <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "#34d399", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{success}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "none",
            background: loading ? "#c44c00" : "#fe5502",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.05rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.25rem",
          }}
        >
          {loading ? (
            "Envoi en cours…"
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Valider et Envoyer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Exchange Reward Modal (unchanged) ────────────────────────────────
function ExchangeModal({ onClose }: { onClose: () => void }) {
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = "exchange-qr-reader";

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }
  };

  useEffect(() => { return () => { stopScanner(); }; }, []);

  useEffect(() => {
    if (mode === "scan" && scanning) {
      setTimeout(async () => {
        html5QrCodeRef.current = new Html5Qrcode(containerId);
        try {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 30, qrbox: { width: 200, height: 200 } },
            (decodedText) => {
              let id = decodedText;
              const m = decodedText.match(/\/scan\/([^\/?#]+)/);
              if (m) id = m[1];
              stopScanner();
              window.location.href = `/scan/${id}`;
            },
            () => {}
          );
        } catch {
          setError("Impossible d'accéder à la caméra.");
          setScanning(false);
        }
      }, 100);
    } else {
      stopScanner();
    }
  }, [mode, scanning]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let rawInput = customerIdInput.trim().replace(/^#/, "");
    if (!rawInput) { setError("Veuillez entrer un numéro de carte"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/customer/by-id/${encodeURIComponent(rawInput)}`);
      const data = await res.json();
      if (res.ok && data.customer?.customerId) {
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
    <div
      onClick={(e) => { if (e.target === e.currentTarget) { stopScanner(); onClose(); } }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{
        background: "#2d2b4e",
        borderRadius: "1.25rem",
        padding: "2rem",
        width: "100%",
        maxWidth: "520px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.4rem", fontWeight: 700 }}>Échanger Cadeau</h2>
          <button onClick={() => { stopScanner(); onClose(); }} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.6rem" }} aria-label="Fermer">×</button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {(["scan", "manual"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); if (m === "scan") setScanning(true); else setScanning(false); setError(""); }}
              style={{
                flex: 1, padding: "0.6rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.88rem",
                border: "none", cursor: "pointer",
                background: mode === m ? "#fe5502" : "#3d3b5e",
                color: "#fff",
              }}>
              {m === "scan" ? "📷 Scanner" : "✏️ Saisir le numéro"}
            </button>
          ))}
        </div>

        {mode === "scan" && scanning && (
          <div style={{ marginBottom: "1rem" }}>
            <div id={containerId} style={{ overflow: "hidden", borderRadius: "0.5rem", background: "#000", minHeight: "260px", width: "100%" }} />
            {error && <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}
            <p style={{ color: "#9ca3af", fontSize: "0.78rem", textAlign: "center", marginTop: "0.5rem" }}>Placez le QR code dans le cadre</p>
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input type="text" placeholder="Ex: CUST-123456-ABC ou 9A3F"
              value={customerIdInput} onChange={(e) => setCustomerIdInput(e.target.value)}
              style={{ width: "100%", padding: "1rem", borderRadius: "0.75rem", background: "#3d3b5e", border: "1.5px solid #4a4870", color: "#fff", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
            {error && <p style={{ color: "#f87171", fontSize: "0.82rem", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "1rem", background: loading ? "#c44c00" : "#fe5502", color: "#fff", border: "none", borderRadius: "0.75rem", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Recherche…" : "Détecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component (centered, no sidebar) ──────────────────
export default function RewardExchange() {
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showExchange, setShowExchange] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#13122a",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      {/* Top-right Restaurant Admin */}
      <div style={{
        position: "absolute",
        top: "1.5rem",
        right: "2rem",
        color: "#9ca3af",
        fontSize: "0.88rem",
      }}>
        Restaurant Admin
      </div>

      {/* Centered content */}
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            Tableau de bord
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "1rem", margin: 0 }}>
            Bienvenue sur votre tableau de bord de fidélité
          </p>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Ajouter des Points */}
          <button
            onClick={() => setShowAddPoints(true)}
            style={{
              flex: "1 1 280px",
              padding: "2rem 1.5rem",
              borderRadius: "1rem",
              background: "#fe5502",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              transition: "transform 0.15s, filter 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
          >
            <div style={{ width: "52px", height: "52px", background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>Ajouter des Points</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.2rem" }}>TERMINAL CAISSE</div>
            </div>
          </button>

          {/* Échanger Cadeau */}
          <button
            onClick={() => setShowExchange(true)}
            style={{
              flex: "1 1 280px",
              padding: "2rem 1.5rem",
              borderRadius: "1rem",
              background: "#2d2b4e",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              transition: "transform 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3d3b5e"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2d2b4e"; }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fe5502" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            <div>
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>Échanger Cadeau</div>
              <div style={{ color: "#6b7280", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.2rem" }}>CONSOMMER POINTS</div>
            </div>
          </button>
        </div>
      </div>

      {showAddPoints && <AddPointsModal onClose={() => setShowAddPoints(false)} />}
      {showExchange && <ExchangeModal onClose={() => setShowExchange(false)} />}
    </div>
  );
}