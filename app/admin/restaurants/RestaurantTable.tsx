"use client";

import { useState } from "react";
import { Restaurant } from "@prisma/client";

interface RestaurantWithDetails extends Restaurant {
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  _count: {
    customers: number;
  };
  loyaltyProgram: {
    id: string;
  } | null;
  subscription?: {
    plan: string;
  } | null;
  plan?: string;
}

interface RestaurantTableProps {
  restaurants: RestaurantWithDetails[];
}

const STATUS_CONFIG = {
  ACTIVE:    { label: "Actif",      dot: "#22c55e", bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  PENDING:   { label: "En attente", dot: "#f59e0b", bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  SUSPENDED: { label: "Suspendu",   dot: "#ef4444", bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
};

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  FREE:       { label: "1 mois",   color: "#6b7280", bg: "#f9fafb" },
  BASIC:      { label: "3 mois",   color: "#2563eb", bg: "#eff6ff" },
  PREMIUM:    { label: "6 mois",   color: "#7c3aed", bg: "#f5f3ff" },
  ENTERPRISE: { label: "1 an",     color: "#d97706", bg: "#fffbeb" },
};

function ConfirmModal({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "2rem 2.5rem",
          maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#fef2f2", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 1.25rem",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>

        <h3 style={{ margin: "0 0 .5rem", fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
          Supprimer le restaurant
        </h3>
        <p style={{ margin: "0 0 1.75rem", fontSize: ".9rem", color: "#6b7280", lineHeight: 1.6 }}>
          Voulez-vous vraiment supprimer <strong style={{ color: "#111827" }}>{name}</strong> ?
          Cette action est <strong style={{ color: "#ef4444" }}>irréversible</strong>.
        </p>

        <div style={{ display: "flex", gap: ".75rem", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: ".65rem 1.25rem", borderRadius: 10,
              border: "1.5px solid #e5e7eb", background: "#fff",
              color: "#374151", fontWeight: 600, fontSize: ".875rem",
              cursor: "pointer", transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: ".65rem 1.25rem", borderRadius: 10,
              border: "none", background: "#ef4444",
              color: "#fff", fontWeight: 600, fontSize: ".875rem",
              cursor: "pointer", transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#dc2626")}
            onMouseLeave={e => (e.currentTarget.style.background = "#ef4444")}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantTable({ restaurants: initialRestaurants }: RestaurantTableProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleStatusChange = async (restaurantId: string, newStatus: string) => {
    setUpdatingId(restaurantId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRestaurants(prev => prev.map(r =>
          r.id === restaurantId ? { ...r, accountStatus: updated.accountStatus } : r
        ));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Erreur ${res.status} lors de la mise à jour du statut`);
      }
    } catch {
      setError("Erreur réseau lors de la mise à jour du statut");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePlanChange = async (restaurantId: string, newPlan: string) => {
    setUpdatingId(restaurantId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRestaurants(prev => prev.map(r =>
          r.id === restaurantId
            ? { ...r, subscription: { ...r.subscription, plan: updated.plan }, plan: updated.plan }
            : r
        ));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Erreur ${res.status} lors de la mise à jour du plan`);
      }
    } catch {
      setError("Erreur réseau lors de la mise à jour du plan");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    setUpdatingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, { method: "DELETE" });

      if (res.ok) {
        setRestaurants(prev => prev.filter(r => r.id !== id));
      } else {
        // Try to parse JSON error; fall back to status text
        let message = `Erreur ${res.status}`;
        try {
          const data = await res.json();
          message = data.error || data.message || message;
        } catch {
          message = res.statusText || message;
        }
        setError(`Impossible de supprimer le restaurant : ${message}`);
      }
    } catch (err) {
      setError("Erreur réseau lors de la suppression. Vérifiez votre connexion.");
      console.error("Delete error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const currentPlan = (r: RestaurantWithDetails) =>
    r.subscription?.plan || r.plan || "FREE";

  if (restaurants.length === 0) {
    return (
      <div style={{
        background: "#fff", borderRadius: 16, padding: "4rem 2rem",
        textAlign: "center", border: "1.5px dashed #e5e7eb",
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block" }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <p style={{ color: "#9ca3af", margin: 0, fontWeight: 500 }}>Aucun restaurant trouvé</p>
      </div>
    );
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>
        {error && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: ".75rem",
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#991b1b", padding: "1rem 1.25rem",
            borderRadius: 12, marginBottom: "1.25rem", fontSize: ".875rem",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#991b1b", padding: 0, flexShrink: 0 }}
            >✕</button>
          </div>
        )}

        <div style={{
          background: "#fff", borderRadius: 16, overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)",
          border: "1px solid #f3f4f6",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                  {["Restaurant", "Contact", "Propriétaire", "Statut", "Plan", "Clients", "Inscription", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "12px 20px", textAlign: "left",
                      fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em",
                      textTransform: "uppercase", color: "#9ca3af", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r, i) => {
                  const status = STATUS_CONFIG[r.accountStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
                  const plan = PLAN_CONFIG[currentPlan(r)] || PLAN_CONFIG.FREE;
                  const isUpdating = updatingId === r.id;

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: i < restaurants.length - 1 ? "1px solid #f9fafb" : "none",
                        transition: "background .12s",
                        opacity: isUpdating ? 0.6 : 1,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Restaurant */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 700, fontSize: ".8rem",
                          marginBottom: 6,
                        }}>
                          {r.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontSize: ".875rem", fontWeight: 600, color: "#111827" }}>{r.name}</div>
                        <div style={{ fontSize: ".75rem", color: "#9ca3af" }}>{r.email}</div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: ".875rem", color: "#374151" }}>{r.phoneNumber || "—"}</div>
                        <div style={{ fontSize: ".75rem", color: "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{r.address || "—"}</div>
                      </td>

                      {/* Owner */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: ".875rem", fontWeight: 500, color: "#374151" }}>{r.owner.name || "—"}</div>
                        <div style={{ fontSize: ".75rem", color: "#9ca3af" }}>{r.owner.email}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <div style={{
                            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                            width: 7, height: 7, borderRadius: "50%", background: status.dot,
                            boxShadow: `0 0 0 2px ${status.dot}33`,
                            pointerEvents: "none", zIndex: 1,
                          }} />
                          <select
                            value={r.accountStatus}
                            onChange={e => handleStatusChange(r.id, e.target.value)}
                            disabled={isUpdating}
                            style={{
                              paddingLeft: 24, paddingRight: 28, paddingTop: 5, paddingBottom: 5,
                              fontSize: ".78rem", fontWeight: 600, borderRadius: 99,
                              border: `1.5px solid ${status.border}`,
                              background: status.bg, color: status.color,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              appearance: "none", WebkitAppearance: "none",
                              outline: "none",
                            }}
                          >
                            <option value="PENDING">En attente</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="SUSPENDED">Suspendu</option>
                          </select>
                          <svg
                            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                            width="10" height="10" viewBox="0 0 10 10" fill={status.color}
                          >
                            <path d="M2 3.5l3 3 3-3" stroke={status.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        </div>
                      </td>

                      {/* Plan */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <select
                            value={currentPlan(r)}
                            onChange={e => handlePlanChange(r.id, e.target.value)}
                            disabled={isUpdating}
                            style={{
                              paddingLeft: 10, paddingRight: 24, paddingTop: 5, paddingBottom: 5,
                              fontSize: ".78rem", fontWeight: 600, borderRadius: 8,
                              border: `1.5px solid ${plan.color}33`,
                              background: plan.bg, color: plan.color,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                              appearance: "none", WebkitAppearance: "none",
                              outline: "none",
                            }}
                          >
                            <option value="FREE">1 mois</option>
                            <option value="BASIC">3 mois</option>
                            <option value="PREMIUM">6 mois</option>
                            <option value="ENTERPRISE">1 an</option>
                          </select>
                          <svg
                            style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                            width="10" height="10" viewBox="0 0 10 10"
                          >
                            <path d="M2 3.5l3 3 3-3" stroke={plan.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        </div>
                      </td>

                      {/* Customers */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "#f0f9ff", color: "#0369a1",
                          fontSize: ".8rem", fontWeight: 600,
                          padding: "3px 10px", borderRadius: 99,
                          border: "1px solid #bae6fd",
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                          </svg>
                          {r._count.customers}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap", fontSize: ".8rem", color: "#9ca3af" }}>
                        {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        {isUpdating ? (
                          <div style={{
                            width: 20, height: 20, border: "2.5px solid #e5e7eb",
                            borderTopColor: "#ef4444", borderRadius: "50%",
                            animation: "spin .7s linear infinite",
                            display: "inline-block",
                          }} />
                        ) : (
                          <button
                            onClick={() => setDeleteTarget({ id: r.id, name: r.name })}
                            title="Supprimer ce restaurant"
                            style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 34, height: 34, borderRadius: 8,
                              border: "1.5px solid #fecaca", background: "#fef2f2",
                              color: "#ef4444", cursor: "pointer",
                              transition: "all .15s",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#ef4444";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#fef2f2";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 20px", borderTop: "1px solid #f3f4f6",
            background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: ".78rem", color: "#9ca3af" }}>
              {restaurants.length} restaurant{restaurants.length > 1 ? "s" : ""} au total
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select:focus { box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
      `}</style>
    </>
  );
}
