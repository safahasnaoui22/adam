"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
}

interface CustomerData {
  id: string;
  customerId: string;
  name: string;
  points: number;
}

// ─── Add Points Modal ───────────────────────────────────────────────────
function AddPointsModal({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // "Utiliser des points" (deduct) — uses the same client ID field as above
  const [pointsToDeduct, setPointsToDeduct] = useState("");
  const [loadingDeduct, setLoadingDeduct] = useState(false);

  const [spendThreshold, setSpendThreshold] = useState<number | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [loadingRules, setLoadingRules] = useState(true);

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

  const computeStars = (amountDT: number): number => {
    if (!spendThreshold || !pointsEarned || amountDT <= 0) return 0;
    return Math.floor(amountDT / spendThreshold) * pointsEarned;
  };

  const amountNum = parseFloat(amount);
  const previewStars = !isNaN(amountNum) && amountNum > 0 ? computeStars(amountNum) : null;

  const handleSubmit = async () => {
    const rawId = clientId.trim().replace(/^#/, "").toUpperCase();
    if (rawId.length !== 4) {
      setError("Veuillez entrer les 4 derniers caractères de l'ID client");
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
      const validateRes = await fetch(
        `/api/customer/by-short-id/${encodeURIComponent(rawId)}`
      );
      const validateData = await validateRes.json();
      if (!validateRes.ok || !validateData.customer?.id) {
        setError(validateData.error || "Client non trouvé");
        setLoading(false);
        return;
      }

      const dbCustomerId = validateData.customer.id;
      const customerName = validateData.customer.name;
      const addRes = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: dbCustomerId, amount: amountNum }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) {
        setError(addData.error || "Erreur lors de l'ajout des points");
        setLoading(false);
        return;
      }

      setSuccess(
        `✅ ${addData.pointsAdded ?? starsToAdd} point(s) ajouté(s) pour ${customerName} (#${rawId}) ! (Ticket : ${amountNum} DT)`
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

  const handleDeduct = async () => {
    const rawId = clientId.trim().replace(/^#/, "").toUpperCase();
    const val = parseInt(pointsToDeduct, 10);
    if (rawId.length !== 4) {
      setError("Veuillez entrer les 4 derniers caractères de l'ID client");
      setSuccess("");
      return;
    }
    if (isNaN(val) || val <= 0) {
      setError("Nombre de points à déduire invalide");
      setSuccess("");
      return;
    }

    setLoadingDeduct(true);
    setError("");
    setSuccess("");
    try {
      const validateRes = await fetch(`/api/customer/by-short-id/${encodeURIComponent(rawId)}`);
      const validateData = await validateRes.json();
      if (!validateRes.ok || !validateData.customer?.id) {
        setError(validateData.error || "Client non trouvé");
        return;
      }
      if (typeof validateData.customer.points === "number" && val > validateData.customer.points) {
        setError(`Points insuffisants : ${validateData.customer.name} a ${validateData.customer.points} point(s)`);
        return;
      }

      const res = await fetch("/api/customer/deduct-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: validateData.customer.id, pointsToDeduct: val }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la déduction des points");
        return;
      }
      setSuccess(`✅ -${data.deducted ?? val} point(s) pour ${validateData.customer.name} (#${rawId}) — Solde : ${data.newPoints}`);
      setPointsToDeduct("");
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoadingDeduct(false);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.75rem",
          }}
        >
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.4rem", fontWeight: 700 }}>
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
            {pointsEarned} point(s) gagné(s)
          </div>
        )}

        <label
          style={{
            color: "#e5e7eb",
            fontSize: "0.95rem",
            fontWeight: 500,
            display: "block",
            marginBottom: "0.6rem",
          }}
        >
          1. ID Client  *
        </label>
        <input
          type="text"
          placeholder="9514"
          value={clientId}
          onChange={(e) =>
            setClientId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))
          }
          maxLength={4}
          style={{
            width: "100%",
            padding: "1rem 1.1rem",
            borderRadius: "0.75rem",
            background: "#3d3b5e",
            border: "2px solid #5b5aff",
            color: "#fff",
            fontSize: "1.4rem",
            fontFamily: "monospace",
            letterSpacing: "0.4em",
            textAlign: "center",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "0.4rem",
          }}
        />
        <p style={{ color: "#6b7280", fontSize: "0.78rem", margin: "0 0 1.25rem" }}>
          Les 4 derniers caractères de l'ID affiché sur la carte du client
        </p>

        <label
          style={{
            color: "#e5e7eb",
            fontSize: "0.95rem",
            fontWeight: 500,
            display: "block",
            marginBottom: "0.6rem",
          }}
        >
          2. Montant du ticket *
        </label>
        <input
          type="number"
          placeholder="Ex: 45.50 DT"
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
         fontSize: "1.25rem",
fontWeight: 600,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "0.5rem",
          }}
        />

        {previewStars !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "1rem",
              padding: "0.5rem 0.85rem",
              background: previewStars > 0 ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
              borderRadius: "0.5rem",
              border: `1px solid ${previewStars > 0 ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
            }}
          >
            <span style={{ fontSize: "1rem" }}>🪙</span>
            <span
              style={{
                color: previewStars > 0 ? "#34d399" : "#f87171",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {previewStars > 0
                ? `= ${previewStars} point(s) seront ajoutés`
                : `Montant insuffisant (palier min. : ${spendThreshold} DT)`}
            </span>
          </div>
        )}

        {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
        {success && <p style={{ color: "#34d399", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{success}</p>}

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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Valider et Envoyer
            </>
          )}
        </button>

        {/* ─── Utiliser des points ─── */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "1.5rem 0 1.25rem" }} />
        <label
          style={{
            color: "#e5e7eb",
            fontSize: "0.95rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.6rem",
          }}
        >
          <span style={{ fontSize: "1rem" }}>➖</span> Utiliser des points
        </label>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <input
            type="number"
            step="10"
            min="0"
            placeholder="Points à déduire"
            value={pointsToDeduct}
            onChange={(e) => setPointsToDeduct(e.target.value)}
            disabled={loadingDeduct}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "0.9rem 1.1rem",
              borderRadius: "0.75rem",
              background: "#3d3b5e",
              border: "1.5px solid #4a4870",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleDeduct}
            disabled={loadingDeduct}
            style={{
              padding: "0 1.4rem",
              borderRadius: "0.75rem",
              border: "none",
              background: loadingDeduct ? "#991b1b" : "#ef4444",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loadingDeduct ? "not-allowed" : "pointer",
            }}
          >
            {loadingDeduct ? "…" : "Déduire"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Popup (replaces /scan/[id] redirect) ──────────────────────
function CustomerPopup({
  customer,
  rewards,
  onClose,
}: {
  customer: CustomerData;
  rewards: Reward[];
  onClose: () => void;
}) {
  const [points, setPoints] = useState(customer.points);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loadingReward, setLoadingReward] = useState<string | null>(null);

  const shortId = customer.customerId.slice(-4);

  // Only rewards the customer can already claim are shown. Anything that
  // needs more points than the customer has stays hidden (no locked rows).
  const availableRewards = [...rewards]
    .filter((r) => points >= r.pointsRequired)
    .sort((a, b) => a.pointsRequired - b.pointsRequired);

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (points < pointsRequired) {
      setMessage({ text: "Points insuffisants pour cette récompense", type: "error" });
      return;
    }
    setLoadingReward(rewardId);
    setMessage(null);
    try {
      const res = await fetch("/api/customer/redeem-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setMessage({ text: `Récompense échangée — nouveau solde : ${data.newPoints} pts`, type: "success" });
      } else {
        setMessage({ text: data.error || "Erreur", type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur de connexion", type: "error" });
    } finally {
      setLoadingReward(null);
    }
  };

  return (
    <div
      className="cp-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cp-card" role="dialog" aria-modal="true">
        <button className="cp-close" onClick={onClose} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Identity ── */}
        <div className="cp-header">
          <div className="cp-avatar">{customer.name.charAt(0).toUpperCase()}</div>
          <div className="cp-ident">
            <h2 className="cp-name">{customer.name}</h2>
            <span className="cp-id">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Carte #{shortId}
            </span>
          </div>
        </div>

        {/* ── Balance ── */}
        <div className="cp-balance">
          <div>
            <span className="cp-balance-label">Solde de points</span>
            <div className="cp-balance-row">
              <span className="cp-balance-value" key={points}>{points}</span>
              <span className="cp-balance-unit">pts</span>
            </div>
          </div>
          <div className="cp-balance-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        {message && (
          <div className={`cp-message ${message.type}`} role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {message.type === "success" ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              )}
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        {/* ── Rewards ── */}
        <div className="cp-section-header">
          <h3>Récompenses disponibles</h3>
          <span className="cp-count">{availableRewards.length}</span>
        </div>

        {availableRewards.length > 0 ? (
          <div className="cp-rewards">
            {availableRewards.map((reward, i) => (
              <div key={reward.id} className="cp-reward" style={{ animationDelay: `${0.05 * i}s` }}>
                <div className="cp-reward-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <div className="cp-reward-body">
                  <p className="cp-reward-name">{reward.name}</p>
                  {reward.description && <p className="cp-reward-desc">{reward.description}</p>}
                  <span className="cp-reward-points">{reward.pointsRequired} pts</span>
                </div>
                <button
                  className="cp-btn"
                  onClick={() => handleRedeemReward(reward.id, reward.pointsRequired)}
                  disabled={loadingReward !== null}
                >
                  {loadingReward === reward.id ? <span className="cp-spinner" /> : "Échanger"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
              </svg>
            </div>
            <p>Aucune récompense disponible pour le moment</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cpSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes cpItemIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes cpBump { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }
        @keyframes cpSpin { to { transform: rotate(360deg); } }

        .cp-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(10, 8, 22, 0.78);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: cpFadeIn 0.2s ease-out;
        }
        .cp-card {
          position: relative; width: 100%; max-width: 480px;
          max-height: 90vh; overflow-y: auto;
          padding: 1.75rem 1.5rem 1.5rem;
          border-radius: 1.5rem;
          background: linear-gradient(180deg, #2f2c52 0%, #221f3d 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 80px rgba(0,0,0,0.55);
          animation: cpSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cp-card::-webkit-scrollbar { width: 6px; }
        .cp-card::-webkit-scrollbar-thumb { background: #4a4870; border-radius: 3px; }

        .cp-close {
          position: absolute; top: 0.9rem; right: 0.9rem;
          width: 2rem; height: 2rem; border-radius: 50%;
          background: rgba(255,255,255,0.07); border: none; color: #a1a1c4;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .cp-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

        .cp-header { display: flex; align-items: center; gap: 0.9rem; margin: 0 2rem 1.25rem 0; }
        .cp-avatar {
          width: 54px; height: 54px; flex-shrink: 0; border-radius: 16px;
          background: linear-gradient(135deg, #5b5aff, #8f8eff);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.5rem; font-weight: 800;
          box-shadow: 0 8px 20px rgba(91,90,255,0.35);
        }
        .cp-ident { min-width: 0; }
        .cp-name {
          margin: 0 0 0.3rem; color: #fff; font-size: 1.25rem; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cp-id {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.2rem 0.6rem; border-radius: 999px;
          background: rgba(255,255,255,0.07); color: #b9b8d6;
          font-size: 0.75rem; font-weight: 600; font-family: ui-monospace, monospace; letter-spacing: 0.04em;
        }

        .cp-balance {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 1.1rem 1.25rem; margin-bottom: 1.25rem; border-radius: 1.1rem;
          background: linear-gradient(135deg, rgba(254,85,2,0.22), rgba(254,85,2,0.06));
          border: 1px solid rgba(254,85,2,0.3);
        }
        .cp-balance-label { color: #fdb27a; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        .cp-balance-row { display: flex; align-items: baseline; gap: 0.4rem; margin-top: 0.2rem; }
        .cp-balance-value { color: #fff; font-size: 2.4rem; font-weight: 800; line-height: 1; animation: cpBump 0.35s ease-out; }
        .cp-balance-unit { color: #fdb27a; font-size: 1rem; font-weight: 700; }
        .cp-balance-icon {
          width: 52px; height: 52px; flex-shrink: 0; border-radius: 16px;
          background: linear-gradient(135deg, #fe5502, #ff8a3d);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(254,85,2,0.4);
        }

        .cp-message {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.7rem 0.9rem; margin-bottom: 1.1rem; border-radius: 0.75rem;
          font-size: 0.85rem; font-weight: 600; animation: cpFadeIn 0.2s ease-out;
        }
        .cp-message svg { flex-shrink: 0; }
        .cp-message.success { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.28); }
        .cp-message.error { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.28); }

        .cp-section-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
        .cp-section-header h3 { margin: 0; color: #fff; font-size: 1.05rem; font-weight: 700; }
        .cp-count {
          min-width: 1.5rem; height: 1.5rem; padding: 0 0.45rem; border-radius: 999px;
          background: rgba(52,211,153,0.15); color: #34d399;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 800;
        }

        .cp-rewards { display: flex; flex-direction: column; gap: 0.6rem; }
        .cp-reward {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.85rem; border-radius: 1rem;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.15s, background 0.15s;
          animation: cpItemIn 0.3s ease-out backwards;
        }
        .cp-reward:hover { background: rgba(255,255,255,0.07); border-color: rgba(254,85,2,0.4); }
        .cp-reward-icon {
          width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(254,85,2,0.14); color: #ff8a3d;
        }
        .cp-reward-body { flex: 1; min-width: 0; }
        .cp-reward-name { margin: 0; color: #fff; font-size: 0.95rem; font-weight: 700; }
        .cp-reward-desc { margin: 0.15rem 0 0.35rem; color: #9b9ac0; font-size: 0.78rem; line-height: 1.35; }
        .cp-reward-points {
          display: inline-block; margin-top: 0.25rem; padding: 0.12rem 0.55rem; border-radius: 999px;
          background: rgba(254,85,2,0.14); color: #fdb27a; font-size: 0.72rem; font-weight: 700;
        }

        .cp-btn {
          flex-shrink: 0; min-width: 86px; height: 40px; padding: 0 1rem;
          border: none; border-radius: 0.75rem; color: #fff; cursor: pointer;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          font-size: 0.88rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(34,197,94,0.25);
          transition: filter 0.15s, transform 0.1s;
        }
        .cp-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .cp-btn:active:not(:disabled) { transform: scale(0.96); }
        .cp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .cp-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: cpSpin 0.7s linear infinite;
        }

        .cp-empty {
          text-align: center; padding: 1.75rem 1rem; border-radius: 1rem;
          border: 1px dashed rgba(255,255,255,0.14); color: #9b9ac0; font-size: 0.88rem;
        }
        .cp-empty p { margin: 0.6rem 0 0; }
        .cp-empty-icon {
          width: 52px; height: 52px; margin: 0 auto; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05); color: #7c7aa0;
        }

        @media (max-width: 420px) {
          .cp-card { padding: 1.4rem 1.1rem 1.2rem; }
          .cp-reward { flex-wrap: wrap; }
          .cp-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}

// ─── Exchange Reward Modal ────────────────────────────────────────────
function ExchangeModal({
  onClose,
  onCustomerFound,
}: {
  onClose: () => void;
  onCustomerFound: (data: { customer: CustomerData; rewards: Reward[] }) => void;
}) {
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
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

  const lookupCustomer = async (rawId: string) => {
    const cleanId = rawId.trim().replace(/^#/, "").toUpperCase();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/customer/by-short-id/${encodeURIComponent(cleanId)}?details=full`);
      const data = await res.json();
      if (res.ok && data.customer) {
        onCustomerFound({ customer: data.customer, rewards: data.rewards || [] });
        onClose();
      } else {
        setError(data.error || "Client non trouvé");
        processingRef.current = false;
      }
    } catch {
      setError("Erreur de connexion");
      processingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "scan" && scanning) {
      setTimeout(async () => {
        html5QrCodeRef.current = new Html5Qrcode(containerId);
        try {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 30, qrbox: { width: 200, height: 200 } },
            (decodedText) => {
              if (processingRef.current) return;
              processingRef.current = true;
              let id = decodedText;
              const m = decodedText.match(/\/scan\/([^\/?#]+)/);
              if (m) id = m[1];
              stopScanner();
              lookupCustomer(id);
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

  const retryScan = () => {
    processingRef.current = false;
    setError("");
    setScanning(false);
    setTimeout(() => setScanning(true), 150);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shortId = customerIdInput.trim().replace(/^#/, "").toUpperCase();
    if (shortId.length !== 4) {
      setError("Veuillez entrer les 4 derniers caractères de l'ID client");
      return;
    }
    await lookupCustomer(shortId);
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.4rem", fontWeight: 700 }}>Échanger Cadeau</h2>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.6rem" }}
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
                setError("");
                processingRef.current = false;
                if (m === "scan") setScanning(true);
                else setScanning(false);
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
              style={{ overflow: "hidden", borderRadius: "0.5rem", background: "#000", minHeight: "260px", width: "100%" }}
            />
            {error && (
              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <p style={{ color: "#f87171", fontSize: "0.8rem", margin: 0, flex: 1 }}>{error}</p>
                <button
                  onClick={retryScan}
                  style={{ background: "#3d3b5e", border: "none", color: "#fff", borderRadius: "0.4rem", padding: "0.35rem 0.7rem", fontSize: "0.78rem", cursor: "pointer" }}
                >
                  Réessayer
                </button>
              </div>
            )}
            {loading && (
              <p style={{ color: "#fdb27a", fontSize: "0.78rem", textAlign: "center", marginTop: "0.5rem" }}>
                Recherche du client…
              </p>
            )}
            {!error && !loading && (
              <p style={{ color: "#9ca3af", fontSize: "0.78rem", textAlign: "center", marginTop: "0.5rem" }}>
                Placez le QR code dans le cadre
              </p>
            )}
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ color: "#e5e7eb", fontSize: "0.9rem", fontWeight: 500 }}>
              Numéro de carte (4 derniers caractères)
            </label>
            <input
              type="text"
              placeholder="0SKV"
              value={customerIdInput}
              onChange={(e) =>
                setCustomerIdInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))
              }
              maxLength={4}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "#3d3b5e",
                border: "1.5px solid #4a4870",
                color: "#fff",
                fontSize: "1.4rem",
                fontFamily: "monospace",
                letterSpacing: "0.4em",
                textAlign: "center",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {error && <p style={{ color: "#f87171", fontSize: "0.82rem", margin: 0 }}>{error}</p>}
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
               fontSize: "1.25rem",

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
  const [popupData, setPopupData] = useState<{ customer: CustomerData; rewards: Reward[] } | null>(null);

 return (
    <div
      style={{
        minHeight: "50vh",
        background: "#2e283d",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ color: "#fff", fontSize: "3rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            Tableau de bord
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "1rem", margin: 0 }}>
            Bienvenue sur votre tableau de bord de fidélité
          </p>
        </div>

        <div style={{
          display: "grid",
        
         gridTemplateColumns: "repeat(auto-fit, minmax(360px, 460px))",
justifyContent: "center",
gap: "1.5rem",
          width: "100%",
          alignItems: "stretch",
        }}>
     <button
  onClick={() => setShowAddPoints(true)}
  style={{
    width: "100%",
    padding: "1.4rem 1rem", // Reduced height
    boxSizing: "border-box",
    borderRadius: "1.5rem", // Smaller rounded corners
    background: "linear-gradient(135deg, #F97316 0%, #D95B05 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 40px rgba(249,115,22,0.25)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.65rem", // Less space between icon and text
    transition: "transform 0.15s, filter 0.15s",
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)";
    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
  }}
>
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{
                color: "#fff",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 900,
                letterSpacing: "0.2px",
              }}>Ajouter des Points</div>
              <div
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginTop: "0.5rem",
                }}
              >
                TERMINAL CAISSE
              </div>
            </div>
          </button>

       <button
  onClick={() => setShowExchange(true)}
  style={{
    width: "100%",
    padding: "1.4rem 1rem",
    boxSizing: "border-box",
    borderRadius: "1.5rem",
    background: "#352f47",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.65rem",
    transition: "transform 0.15s, background 0.15s",
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.background = "#40395a";
    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.background = "#352f47";
    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
  }}
>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#F97316" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" stroke="#352f47" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" fill="none" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" fill="none" />
            </svg>
            <div>
              <div style={{
                color: "#fff",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 900,
                letterSpacing: "0.2px",
              }}>Échanger Cadeau</div>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginTop: "0.5rem",
                }}
              >
                CONSOMMER POINTS
              </div>
            </div>
          </button>
        </div>
      </div>

      {showAddPoints && <AddPointsModal onClose={() => setShowAddPoints(false)} />}
      {showExchange && (
        <ExchangeModal onClose={() => setShowExchange(false)} onCustomerFound={(data) => setPopupData(data)} />
      )}
      {popupData && (
        <CustomerPopup
          customer={popupData.customer}
          rewards={popupData.rewards}
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
}