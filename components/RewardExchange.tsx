"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

// ─── Add Points Modal ───────────────────────────────────────────────────
function AddPointsModal({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Loyalty program rules fetched from the server
  const [spendThreshold, setSpendThreshold] = useState<number | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [loadingRules, setLoadingRules] = useState(true);

  // Fetch conversion rules once on mount
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch("/api/loyalty-program");
        const data = await res.json();
        if (res.ok) {
          setSpendThreshold(data.spendThreshold);
          setPointsEarned(data.pointsEarned);
        }
      } catch (err) {
        console.error("Failed to fetch loyalty program rules", err);
      } finally {
        setLoadingRules(false);
      }
    };
    fetchRules();
  }, []);

  // Compute preview: how many stars will this amount earn?
  const computeStars = (amountDT: number): number => {
    if (!spendThreshold || !pointsEarned || amountDT <= 0) return 0;
    return Math.floor(amountDT / spendThreshold) * pointsEarned;
  };

  const amountNum = parseFloat(amount);
  const previewStars = !isNaN(amountNum) && amountNum > 0 ? computeStars(amountNum) : null;

  const handleSubmit = async () => {
    const rawId = clientId.trim().replace(/^#/, "");
    if (!rawId) {
      setError("Veuillez entrer un ID client");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Veuillez entrer un montant valide (> 0 DT)");
      return;
    }
    if (spendThreshold === null || pointsEarned === null) {
      setError("Impossible de charger les règles du programme de fidélité");
      return;
    }

    const starsToAdd = computeStars(amountNum);
    if (starsToAdd <= 0) {
      setError(
        `Le montant est inférieur au palier minimum de ${spendThreshold} DT. Aucun point ne sera attribué.`
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Validate customer
      const validateRes = await fetch(
        `/api/customer/by-id/${encodeURIComponent(rawId)}`
      );
      const validateData = await validateRes.json();
      if (!validateRes.ok || !validateData.customer?.id) {
        setError(validateData.error || "Client non trouvé");
        setLoading(false);
        return;
      }

      const dbCustomerId = validateData.customer.id;
      // amount expected by /api/customer/add-points is in "amount" units
      // where 1 amount = 10 stars (as per original code: amount = starsNum / 10)
      const addPointsAmount = starsToAdd / 10;

      // 2. Add points
      const addRes = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: dbCustomerId, amount: addPointsAmount }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || "Erreur lors de l'ajout des points");
        setLoading(false);
        return;
      }

      setSuccess(
        `✅ ${starsToAdd} étoile(s) ajoutée(s) avec succès pour ${rawId} ! (Addition : ${amountNum} DT)`
      );
      setClientId("");
      setAmount("");
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#2d2b4e",
          borderRadius: "1.25rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "520px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.75rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            Ajouter des Points
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "1.6rem",
              lineHeight: 1,
              padding: "0 0.25rem",
            }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Conversion rule banner */}
        {!loadingRules && spendThreshold !== null && pointsEarned !== null && (
          <div
            style={{
              background: "rgba(254,85,2,0.12)",
              border: "1px solid rgba(254,85,2,0.35)",
              borderRadius: "0.65rem",
              padding: "0.65rem 1rem",
              marginBottom: "1.4rem",
              fontSize: "0.82rem",
              color: "#fdb27a",
            }}
          >
            <strong>Règle active :</strong> {spendThreshold} DT dépensé →{" "}
            {pointsEarned} étoile(s) gagnée(s)
          </div>
        )}

        {/* Field 1 – Client ID */}
        <label
          style={{
            color: "#e5e7eb",
            fontSize: "0.95rem",
            fontWeight: 500,
            display: "block",
            marginBottom: "0.6rem",
          }}
        >
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

        {/* Field 2 – Montant de l'addition */}
        <label
          style={{
            color: "#e5e7eb",
            fontSize: "0.95rem",
            fontWeight: 500,
            display: "block",
            marginBottom: "0.6rem",
          }}
        >
          2. Montant de l'addition (DT) *
        </label>
        <input
          type="number"
          placeholder="Ex: 45.50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
            marginBottom: "0.5rem",
          }}
        />

        {/* Live preview */}
        {previewStars !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "1rem",
              padding: "0.5rem 0.85rem",
              background: previewStars > 0
                ? "rgba(52,211,153,0.1)"
                : "rgba(248,113,113,0.1)",
              borderRadius: "0.5rem",
              border: `1px solid ${previewStars > 0 ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
            }}
          >
            <span style={{ fontSize: "1rem" }}>⭐</span>
            <span
              style={{
                color: previewStars > 0 ? "#34d399" : "#f87171",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {previewStars > 0
                ? `= ${previewStars} étoile(s) seront ajoutées`
                : `Montant insuffisant (palier min. : ${spendThreshold} DT)`}
            </span>
          </div>
        )}

        {error && (
          <p
            style={{
              color: "#f87171",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            style={{
              color: "#34d399",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            {success}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || loadingRules}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "none",
            background: loading || loadingRules ? "#c44c00" : "#fe5502",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.05rem",
            cursor: loading || loadingRules ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.25rem",
          }}
        >
          {loading ? (
            "Envoi en cours…"
          ) : loadingRules ? (
            "Chargement des règles…"
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

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
    if (!rawInput) {
      setError("Veuillez entrer un numéro de carte");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/customer/by-id/${encodeURIComponent(rawInput)}`
      );
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
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopScanner();
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#2d2b4e",
          borderRadius: "1.25rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "520px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{ margin: 0, color: "#fff", fontSize: "1.4rem", fontWeight: 700 }}
          >
            Échanger Cadeau
          </h2>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "1.6rem",
            }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {(["scan", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === "scan") setScanning(true);
                else setScanning(false);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.88rem",
                border: "none",
                cursor: "pointer",
                background: mode === m ? "#fe5502" : "#3d3b5e",
                color: "#fff",
              }}
            >
              {m === "scan" ? "📷 Scanner" : "✏️ Saisir le numéro"}
            </button>
          ))}
        </div>

        {mode === "scan" && scanning && (
          <div style={{ marginBottom: "1rem" }}>
            <div
              id={containerId}
              style={{
                overflow: "hidden",
                borderRadius: "0.5rem",
                background: "#000",
                minHeight: "260px",
                width: "100%",
              }}
            />
            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                }}
              >
                {error}
              </p>
            )}
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.78rem",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              Placez le QR code dans le cadre
            </p>
          </div>
        )}

        {mode === "manual" && (
          <form
            onSubmit={handleManualSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <input
              type="text"
              placeholder="Ex: CUST-123456-ABC ou 9A3F"
              value={customerIdInput}
              onChange={(e) => setCustomerIdInput(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "#3d3b5e",
                border: "1.5px solid #4a4870",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ color: "#f87171", fontSize: "0.82rem", margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: loading ? "#c44c00" : "#fe5502",
                color: "#fff",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Recherche…" : "Détecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────────────
export default function RewardExchange() {
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showExchange, setShowExchange] = useState(false);

  return (
    <div
      style={{
        minHeight: "50vh",
        background: "#13122a",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Centered content */}
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: "0 0 0.5rem",
            }}
          >
            Tableau de bord
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "1rem", margin: 0 }}>
            Bienvenue sur votre tableau de bord de fidélité
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
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
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter =
                "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter =
                "brightness(1)";
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                background: "rgba(255,255,255,0.25)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>
                Ajouter des Points
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: "0.2rem",
                }}
              >
                TERMINAL CAISSE
              </div>
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
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#3d3b5e";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#2d2b4e";
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fe5502"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <div>
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>
                Échanger Cadeau
              </div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: "0.2rem",
                }}
              >
                CONSOMMER POINTS
              </div>
            </div>
          </button>
        </div>
      </div>

      {showAddPoints && (
        <AddPointsModal onClose={() => setShowAddPoints(false)} />
      )}
      {showExchange && (
        <ExchangeModal onClose={() => setShowExchange(false)} />
      )}
    </div>
  );
}