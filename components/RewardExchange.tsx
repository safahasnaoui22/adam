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
      const addPointsAmount = starsToAdd / 10;

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
        `✅ ${starsToAdd} étoile(s) ajoutée(s) pour ${customerName} (#${rawId}) ! (Addition : ${amountNum} DT)`
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
            {pointsEarned} étoile(s) gagnée(s)
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
          1. ID Client (4 derniers caractères) *
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

  // ─ Add points (same logic/UI as AddPointsModal) ─
  const [addAmount, setAddAmount] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [spendThreshold, setSpendThreshold] = useState<number | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [loadingRules, setLoadingRules] = useState(true);

  // ─ Redeem points manually ─
  const [redeemAmount, setRedeemAmount] = useState("");
  const [loadingRedeem, setLoadingRedeem] = useState(false);

  // ─ Redeem reward ─
  const [loadingReward, setLoadingReward] = useState<string | null>(null);

  const shortId = customer.customerId.slice(-4);

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

  const addAmountNum = parseFloat(addAmount);
  const previewStars = !isNaN(addAmountNum) && addAmountNum > 0 ? computeStars(addAmountNum) : null;

  const handleAddPoints = async () => {
    if (isNaN(addAmountNum) || addAmountNum <= 0) {
      setMessage({ text: "Veuillez entrer un montant valide (> 0 DT)", type: "error" });
      return;
    }
    if (spendThreshold === null || pointsEarned === null) {
      setMessage({ text: "Impossible de charger les règles du programme de fidélité", type: "error" });
      return;
    }
    const starsToAdd = computeStars(addAmountNum);
    if (starsToAdd <= 0) {
      setMessage({ text: `Montant inférieur au palier minimum de ${spendThreshold} DT`, type: "error" });
      return;
    }

    setLoadingAdd(true);
    setMessage(null);
    try {
      const res = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, amount: starsToAdd / 10 }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setMessage({ text: `+${starsToAdd} pts pour ${addAmountNum} DT — Solde : ${data.newPoints}`, type: "success" });
        setAddAmount("");
      } else {
        setMessage({ text: data.error || "Erreur", type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur de connexion", type: "error" });
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleRedeemPoints = async () => {
    const val = parseInt(redeemAmount);
    if (isNaN(val) || val <= 0) {
      setMessage({ text: "Nombre de points invalide", type: "error" });
      return;
    }
    if (val > points) {
      setMessage({ text: "Points insuffisants", type: "error" });
      return;
    }
    setLoadingRedeem(true);
    setMessage(null);
    try {
      const res = await fetch("/api/customer/deduct-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, pointsToDeduct: val }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPoints);
        setMessage({ text: `-${data.deducted} pts — Solde : ${data.newPoints}`, type: "success" });
        setRedeemAmount("");
      } else {
        setMessage({ text: data.error || "Erreur", type: "error" });
      }
    } catch {
      setMessage({ text: "Erreur de connexion", type: "error" });
    } finally {
      setLoadingRedeem(false);
    }
  };

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
        setMessage({ text: `Récompense échangée 🎉 — Solde : ${data.newPoints}`, type: "success" });
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
      <div className="cp-card">
        <button className="cp-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>

        <div className="cp-header">
          <div className="cp-avatar">{customer.name.charAt(0).toUpperCase()}</div>
          <h2 className="cp-name">{customer.name}</h2>
          <p className="cp-id">#{shortId}</p>
        </div>

        <div className="cp-balance">
          <div className="cp-balance-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="cp-balance-info">
            <span className="cp-balance-value">{points}</span>
            <span className="cp-balance-label">points disponibles</span>
          </div>
        </div>

        {message && (
          <div className={`cp-message ${message.type}`}>
            <span className="cp-message-icon">
              {message.type === "success" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </span>
            {message.text}
          </div>
        )}

        {/* Ajouter des points — same function as AddPointsModal */}
        <div className="cp-section" style={{ animationDelay: "0.05s" }}>
          <div className="cp-section-header">
            <span className="cp-section-icon cp-icon-orange">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fe5502" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <h3>Ajouter des points</h3>
          </div>

          {!loadingRules && spendThreshold !== null && pointsEarned !== null && (
            <div className="cp-rule-banner">
              <strong>Règle active :</strong> {spendThreshold} DT dépensé → {pointsEarned} étoile(s) gagnée(s)
            </div>
          )}

          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Montant de l'addition (DT)"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            disabled={loadingAdd}
            className="cp-input cp-input-full"
          />

          {previewStars !== null && (
            <div className={`cp-preview ${previewStars > 0 ? "ok" : "warn"}`}>
              ⭐{" "}
              {previewStars > 0
                ? `= ${previewStars} étoile(s) seront ajoutées`
                : `Montant insuffisant (palier min. : ${spendThreshold} DT)`}
            </div>
          )}

          <button onClick={handleAddPoints} disabled={loadingAdd || loadingRules} className="cp-submit-btn">
            {loadingAdd ? (
              "Envoi en cours…"
            ) : loadingRules ? (
              "Chargement des règles…"
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Valider et Envoyer
              </>
            )}
          </button>
        </div>

        {/* Utiliser des points */}
        <div className="cp-section" style={{ animationDelay: "0.1s" }}>
          <div className="cp-section-header">
            <span className="cp-section-icon cp-icon-red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <h3>Utiliser des points</h3>
          </div>
          <div className="cp-row">
            <input
              type="number"
              step="10"
              min="0"
              placeholder="Points à déduire"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              disabled={loadingRedeem}
              className="cp-input"
            />
            <button onClick={handleRedeemPoints} disabled={loadingRedeem} className="cp-btn cp-btn-red">
              {loadingRedeem ? "…" : "Déduire"}
            </button>
          </div>
        </div>

        {/* Récompenses disponibles */}
        {rewards.length > 0 && (
          <div className="cp-section" style={{ animationDelay: "0.15s" }}>
            <div className="cp-section-header">
              <span className="cp-section-icon cp-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </span>
              <h3>Récompenses disponibles</h3>
            </div>
            <div className="cp-rewards">
              {rewards.map((reward) => {
                const isAvailable = points >= reward.pointsRequired;
                return (
                  <div key={reward.id} className={`cp-reward ${isAvailable ? "available" : "locked"}`}>
                    <div>
                      <p className="cp-reward-name">{reward.name}</p>
                      <p className="cp-reward-points">{reward.pointsRequired} points</p>
                      {reward.description && <p className="cp-reward-desc">{reward.description}</p>}
                    </div>
                    {isAvailable ? (
                      <button
                        className="cp-btn cp-btn-green"
                        onClick={() => handleRedeemReward(reward.id, reward.pointsRequired)}
                        disabled={loadingReward === reward.id}
                      >
                        {loadingReward === reward.id ? "…" : "Échanger"}
                      </button>
                    ) : (
                      <span className="cp-lock">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cpSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cpPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes cpPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes cpSectionIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .cp-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.78);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: cpFadeIn 0.2s ease-out;
        }
        .cp-card {
          background: linear-gradient(165deg, #34315a 0%, #221f3d 100%);
          border-radius: 1.5rem;
          padding: 2rem;
          width: 100%; max-width: 480px;
          max-height: 92vh; overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(254,85,2,0.18);
          animation: cpSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-card::-webkit-scrollbar { width: 6px; }
        .cp-card::-webkit-scrollbar-thumb { background: #4a4870; border-radius: 3px; }

        .cp-close {
          position: absolute; top: 1rem; right: 1.25rem;
          background: rgba(255,255,255,0.08); border: none; color: #9ca3af;
          width: 2.25rem; height: 2.25rem; border-radius: 50%;
          font-size: 1.4rem; cursor: pointer; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s, transform 0.2s;
        }
        .cp-close:hover { background: rgba(248,113,113,0.2); color: #f87171; transform: rotate(90deg); }

        .cp-header { text-align: center; margin-bottom: 1rem; }
        .cp-avatar {
          width: 60px; height: 60px; margin: 0 auto 0.6rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #5b5aff, #8b8aff);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.6rem; font-weight: 800;
          box-shadow: 0 8px 24px rgba(91,90,255,0.4);
          animation: cpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
        }
        .cp-name { color: #fff; font-size: 1.3rem; font-weight: 800; margin: 0 0 0.2rem; }
        .cp-id { color: #6b7280; font-size: 0.8rem; font-family: monospace; margin: 0; letter-spacing: 0.05em; }

        .cp-balance {
          display: flex; align-items: center; gap: 1rem;
          background: linear-gradient(135deg, rgba(254,85,2,0.18), rgba(254,85,2,0.04));
          border: 1px solid rgba(254,85,2,0.3);
          border-radius: 1.1rem;
          padding: 1.1rem 1.25rem;
          margin-bottom: 1.25rem;
        }
        .cp-balance-icon {
          width: 52px; height: 52px; flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #fe5502, #ff8a3d);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(254,85,2,0.4);
          animation: cpPulse 2.4s ease-in-out infinite;
        }
        .cp-balance-info { display: flex; flex-direction: column; }
        .cp-balance-value { color: #fff; font-size: 2rem; font-weight: 800; line-height: 1.1; }
        .cp-balance-label { color: #fdb27a; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem; }

        .cp-message {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 0.9rem; border-radius: 0.6rem; font-size: 0.85rem; font-weight: 600;
          margin-bottom: 1.1rem; animation: cpFadeIn 0.2s ease-out;
        }
        .cp-message-icon { display: flex; flex-shrink: 0; }
        .cp-message.success { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
        .cp-message.error { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }

        .cp-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 0.9rem;
          padding: 1.1rem;
          margin-bottom: 1rem;
          animation: cpSectionIn 0.4s ease-out backwards;
        }
        .cp-section-header { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.85rem; }
        .cp-section-icon {
          width: 30px; height: 30px; border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cp-icon-orange { background: rgba(254,85,2,0.12); }
        .cp-icon-red { background: rgba(239,68,68,0.12); }
        .cp-icon-green { background: rgba(22,163,74,0.12); }
        .cp-section h3 { color: #e5e7eb; font-size: 0.95rem; font-weight: 700; margin: 0; }

        .cp-rule-banner {
          background: rgba(254,85,2,0.12); border: 1px solid rgba(254,85,2,0.35);
          border-radius: 0.6rem; padding: 0.55rem 0.85rem; margin-bottom: 0.85rem;
          font-size: 0.8rem; color: #fdb27a;
        }

        .cp-row { display: flex; gap: 0.5rem; }
        .cp-input {
          flex: 1; padding: 0.85rem 1rem; border-radius: 0.65rem;
          background: #3d3b5e; border: 1.5px solid #4a4870; color: #fff;
          font-size: 0.95rem; outline: none; box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .cp-input:focus { border-color: #5b5aff; }
        .cp-input::placeholder { color: #7c7aa0; }
        .cp-input-full { width: 100%; margin-bottom: 0.6rem; }

        .cp-preview {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 0.75rem; border-radius: 0.5rem;
          font-size: 0.82rem; font-weight: 600; margin-bottom: 0.85rem;
        }
        .cp-preview.ok { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); color: #34d399; }
        .cp-preview.warn { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); color: #f87171; }

        .cp-submit-btn {
          width: 100%; padding: 0.9rem; border: none; border-radius: 0.65rem;
          background: linear-gradient(135deg, #fe5502, #ff8a3d);
          color: #fff; font-weight: 700; font-size: 0.98rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: filter 0.15s, transform 0.1s;
        }
        .cp-submit-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .cp-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .cp-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cp-btn {
          padding: 0.85rem 1.1rem; border: none; border-radius: 0.65rem;
          font-weight: 700; font-size: 0.92rem; cursor: pointer; color: #fff;
          transition: filter 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .cp-btn:active { transform: scale(0.97); }
        .cp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .cp-btn-red { background: #ef4444; }
        .cp-btn-red:hover:not(:disabled) { filter: brightness(1.1); }
        .cp-btn-green { background: #16a34a; }
        .cp-btn-green:hover:not(:disabled) { filter: brightness(1.1); }

        .cp-rewards { display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto; }
        .cp-reward {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          padding: 0.85rem; border-radius: 0.65rem;
          transition: transform 0.15s;
        }
        .cp-reward.available { background: rgba(254,85,2,0.08); border: 1px solid rgba(254,85,2,0.25); }
        .cp-reward.locked { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); opacity: 0.6; }
        .cp-reward-name { color: #fff; font-weight: 600; font-size: 0.92rem; margin: 0; }
        .cp-reward-points { color: #fdb27a; font-size: 0.78rem; margin: 0.15rem 0 0; }
        .cp-reward-desc { color: #6b7280; font-size: 0.75rem; margin: 0.15rem 0 0; }
        .cp-lock { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; flex-shrink: 0; }
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
  const [popupData, setPopupData] = useState<{ customer: CustomerData; rewards: Reward[] } | null>(null);

  return (
    <div
      style={{
        minHeight: "50vh",
        background: "#2e283d",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
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
          <button
            onClick={() => setShowAddPoints(true)}
            style={{
              flex: "1 1 300px",
              padding: "2rem 1.5rem",
              borderRadius: "1rem",
              background: "#F97316",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              transition: "transform 0.15s, filter 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)";
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
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>Ajouter des Points</div>
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
              (e.currentTarget as HTMLButtonElement).style.background = "#3d3b5e";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#2d2b4e";
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fe5502" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <div>
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>Échanger Cadeau</div>
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