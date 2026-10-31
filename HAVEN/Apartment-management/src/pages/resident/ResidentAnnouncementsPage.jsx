import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, ShieldAlert, Calendar, User } from "lucide-react";
import { getPublicAnnouncements } from "../../api/shared";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { formatDate } from "../../utils/formatters";

export const ResidentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicAnnouncements();
        setAnnouncements(data || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
        setError("Failed to fetch published announcements from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading society circulars..." />;
  }

  const filtered = announcements.filter((item) => {
    if (filterCategory === "ALL") return true;
    return item.category === filterCategory;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "960px" }}>
      <div className="card-header">
        <div>
          <h2>Society Circulars & Notices</h2>
          <p className="card-subtitle">Official RWA communications, maintenance schedules, DG backup, and security guidelines</p>
        </div>

        {/* Category Filter */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["ALL", "GENERAL", "MAINTENANCE", "SECURITY", "PAYMENT", "EMERGENCY"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${filterCategory === cat ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === "ALL" ? "All Notices" : cat}
            </button>
          ))}
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <Bell size={44} className="empty-state-icon" />
          <h3 className="empty-state-title">No Circulars Found</h3>
          <p>There are no active notices matching your selected category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filtered.map((item) => {
            const isEmergency = item.category === "EMERGENCY";
            const isSecurity = item.category === "SECURITY";

            return (
              <div
                key={item.announcement_id}
                className="card"
                style={{
                  borderLeft: isEmergency
                    ? "4px solid var(--color-brick)"
                    : isSecurity
                    ? "4px solid var(--color-warning)"
                    : "4px solid var(--color-forest)",
                  backgroundColor: isEmergency ? "var(--color-danger-bg)" : "var(--color-white)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {isEmergency && <AlertTriangle size={20} color="var(--color-brick)" />}
                    {isSecurity && <ShieldAlert size={20} color="var(--color-warning)" />}
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)" }}>
                      {item.title}
                    </h3>
                  </div>

                  <span
                    className={`badge ${
                      isEmergency
                        ? "badge-danger"
                        : isSecurity
                        ? "badge-warning"
                        : "badge-info"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <p style={{ fontSize: "0.9rem", color: "var(--color-dark)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {item.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    marginTop: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border-subtle)",
                    fontSize: "0.8rem",
                    color: "var(--color-muted)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calendar size={13} />
                    <span>Published: {formatDate(item.published_date)}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <User size={13} />
                    <span>RWA Office: @{item.author || "Administration"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
