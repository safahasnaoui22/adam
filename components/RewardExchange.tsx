"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

// ─── Types ────────────────────────────────────────────────────────────
type Page = "dashboard" | "systeme" | "programme" | "qr" | "spin" | "clients";

// ─── Add Points Modal ─────────────────────────────────────────────────
function AddPointsModal({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("");
  const [montant, setMontant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    const rawId = clientId.trim().replace(/^#/, "");
    if (!rawId) { setError("Veuillez entrer un ID client"); return; }
    if (!montant || isNaN(Number(montant)) || Number(montant) <= 0) {
      setError("Veuillez entrer un montant valide");
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
      const addRes = await fetch(`/api/customer/${customerId}/add-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant: Number(montant) }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || "Erreur lors de l'ajout des points");
        setLoading(false);
        return;
      }
      setSuccess(`✅ Points ajoutés avec succès pour ${rawId} !`);
      setClientId("");
      setMontant("");
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
        {/* Header */}
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

        {/* Field 1: Client ID */}
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

        {/* Field 2: Montant */}
        <label style={{ color: "#e5e7eb", fontSize: "0.95rem", fontWeight: 500, display: "block", marginBottom: "0.6rem" }}>
          2. Montant de l'addition (DT) *
        </label>
        <input
          type="number"
          placeholder="Ex: 24.50"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          step="0.01"
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

        {/* Feedback */}
        {error && (
          <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "#34d399", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{success}</p>
        )}

        {/* Submit */}
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

// ─── Exchange Reward Modal ─────────────────────────────────────────────
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

// ─── Sidebar ──────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate }: { activePage: Page; onNavigate: (p: Page) => void }) {
  const navItems: { page: Page; label: string; icon: React.ReactNode; group?: string }[] = [
    {
      page: "dashboard", label: "Tableau de bord", group: "PRINCIPAL",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    },
    {
      page: "systeme", label: "Système de Point",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    },
    {
      page: "programme", label: "Programme & Carte",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    },
    {
      page: "qr", label: "QR Restaurant", group: "ACQUISITION",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3v3"/><path d="M21 21v-1"/><path d="M16 16v5"/><path d="M12 3v5"/><path d="M12 12v2"/></svg>,
    },
    {
      page: "spin", label: "Spin & Win (Jeu)",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    },
    {
      page: "clients", label: "Clients & Historique",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ];

  let lastGroup: string | undefined;

  return (
    <aside style={{
      width: "240px",
      minHeight: "100vh",
      background: "#1a1830",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      padding: "1.25rem 0",
    }}>
      {/* Logo */}
      <div style={{ padding: "0.5rem 1.25rem 1.75rem" }}>
        <span style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          BONOO<span style={{ color: "#fe5502" }}>.</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const showGroup = item.group && item.group !== lastGroup;
          if (item.group) lastGroup = item.group;

          return (
            <div key={item.page}>
              {showGroup && (
                <p style={{
                  color: "#6b7280", fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  margin: "1rem 0 0.4rem 0.5rem", padding: 0,
                }}>
                  {item.group}
                </p>
              )}
              <button
                onClick={() => onNavigate(item.page)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.65rem",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: activePage === item.page ? 600 : 400,
                  background: activePage === item.page ? "#fe5502" : "transparent",
                  color: activePage === item.page ? "#fff" : "#9ca3af",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (activePage !== item.page) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#2d2b4e";
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== item.page) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                  }
                }}
              >
                {item.icon}
                {item.label}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Quit */}
      <div style={{ padding: "0 0.75rem 0.5rem" }}>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.6rem 0.85rem", width: "100%",
            background: "transparent", border: "none",
            color: "#fe5502", fontSize: "0.88rem", fontWeight: 500,
            cursor: "pointer", borderRadius: "0.5rem",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Quitter
        </button>
      </div>
    </aside>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{
      background: "#2d2b4e",
      borderRadius: "0.875rem",
      padding: "1.5rem 1.25rem",
      flex: 1,
      minWidth: 0,
      position: "relative",
    }}>
      <div style={{ color: "#5b5aff", marginBottom: "0.75rem", fontSize: "1.4rem" }}>{icon}</div>
      <div style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "#6b7280", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.4rem" }}>{label}</div>
      <button style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "0.9rem" }} aria-label="Info">ℹ</button>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────
function DashboardPage({ onAddPoints, onExchange }: { onAddPoints: () => void; onExchange: () => void }) {
  return (
    <main style={{ flex: 1, padding: "2.5rem 3rem", overflowY: "auto" }}>
      {/* Top-right user */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <span style={{ color: "#9ca3af", fontSize: "0.88rem" }}>Restaurant Admin</span>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ color: "#fff", fontSize: "2.25rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
          Tableau de bord
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "1rem", margin: 0 }}>
          Bienvenue sur votre tableau de bord de fidélité
        </p>
      </div>

      {/* Two action cards */}
      <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {/* Ajouter des Points */}
        <button
          onClick={onAddPoints}
          style={{
            flex: 1, padding: "2rem 1.5rem",
            borderRadius: "1rem",
            background: "#fe5502",
            border: "none",
            cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
            transition: "transform 0.15s, filter 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"; }}
        >
          <div style={{ width: "52px", height: "52px", background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          onClick={onExchange}
          style={{
            flex: 1, padding: "2rem 1.5rem",
            borderRadius: "1rem",
            background: "#2d2b4e",
            border: "none",
            cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
            transition: "transform 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3d3b5e"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2d2b4e"; }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fe5502" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

      {/* Stats row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard
          value="1"
          label="Clients Inscrits"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b8dee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <StatCard
          value="0"
          label="Points Consommés"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fe5502" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>
            </svg>
          }
        />
        <StatCard
          value="0%"
          label="Taux d'Échange"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          }
        />
        <StatCard
          value="0%"
          label="Taux de Retour"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          }
        />
      </div>

      {/* Bottom tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {["📊 STATISTIQUES", "🎁 RÉCOMPENSES", "📣 MARKETING", "🎮 JEUX"].map((tab, i) => (
          <button key={tab} style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "2rem",
            border: "none",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            cursor: "pointer",
            background: i === 0 ? "#fff" : "transparent",
            color: i === 0 ? "#1a1830" : "#6b7280",
          }}>{tab}</button>
        ))}
      </div>
    </main>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────
export default function RewardExchange() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showExchange, setShowExchange] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#13122a", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {activePage === "dashboard" && (
        <DashboardPage
          onAddPoints={() => setShowAddPoints(true)}
          onExchange={() => setShowExchange(true)}
        />
      )}

      {activePage !== "dashboard" && (
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>Section : {activePage}</p>
        </main>
      )}

      {showAddPoints && <AddPointsModal onClose={() => setShowAddPoints(false)} />}
      {showExchange && <ExchangeModal onClose={() => setShowExchange(false)} />}
    </div>
  );
}
