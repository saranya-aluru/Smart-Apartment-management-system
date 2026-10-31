import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Home,
  Wrench,
  Sparkles,
  BookmarkCheck,
  CalendarDays,
  Bell,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus
} from "lucide-react";
import { getResidentDashboard } from "../../api/resident";
import { getPublicAnnouncements } from "../../api/shared";
import { StatCard } from "../../components/common/StatCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { formatDate } from "../../utils/formatters";

export const ResidentDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, notices] = await Promise.all([
        getResidentDashboard(),
        getPublicAnnouncements().catch(() => [])
      ]);
      setDashboardData(dash);
      setAnnouncements(notices ? notices.slice(0, 3) : []);
    } catch (err) {
      console.error("Failed to load resident dashboard:", err);
      setError("Failed to load resident dashboard details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !dashboardData) {
    return <LoadingSpinner message="Loading your resident portal..." />;
  }

  const profile = dashboardData?.profile || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Resident Welcome Card */}
      <div
        className="card"
        style={{
          backgroundColor: "var(--color-forest)",
          color: "var(--color-white)",
          border: "none",
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-sage)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            RESIDENT PORTAL
          </span>
          <h2 style={{ color: "var(--color-white)", fontSize: "1.75rem", marginTop: "0.25rem" }}>
            Namaste, {profile.full_name || "Resident"}!
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", marginTop: "0.4rem", fontSize: "0.95rem" }}>
            Flat <strong>{profile.apartment_number}</strong> • {profile.building} • Floor {profile.floor}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            to="/resident/maintenance"
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: "var(--color-white)", color: "var(--color-forest)", borderColor: "transparent" }}
          >
            <Wrench size={15} />
            <span>Raise Repair Ticket</span>
          </Link>
          <Link
            to="/resident/clubhouse"
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", color: "var(--color-white)", borderColor: "rgba(255, 255, 255, 0.3)" }}
          >
            <BookmarkCheck size={15} />
            <span>Book Amenity</span>
          </Link>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem"
        }}
      >
        <StatCard
          title="Allocated Flat"
          value={`Flat ${profile.apartment_number || "—"}`}
          icon={Home}
          subtitle={`${profile.building || "—"}, Floor ${profile.floor || "—"}`}
        />

        <StatCard
          title="Open Maintenance"
          value={dashboardData?.openMaintenance ?? 0}
          icon={Wrench}
          subtitle="Tickets in progress or pending"
          badge={dashboardData?.openMaintenance > 0 ? "Active" : "None"}
        />

        <StatCard
          title="Service Requests"
          value={dashboardData?.serviceRequests ?? 0}
          icon={Sparkles}
          subtitle="Household services requested"
        />

        <StatCard
          title="Clubhouse Bookings"
          value={dashboardData?.clubhouseBookings ?? 0}
          icon={BookmarkCheck}
          subtitle="Your amenity reservations"
        />
      </div>

      {/* Two Column Grid: Shortcuts & Announcements */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}
      >
        {/* Quick Resident Services */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Society Services & Amenities</h3>
              <p className="card-subtitle">Quick actions for your home and society community</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              to="/resident/maintenance"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-cream-soft)",
                border: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Wrench size={18} color="var(--color-forest)" />
                <div>
                  <strong style={{ color: "var(--color-dark)", fontSize: "0.875rem", display: "block" }}>
                    Raise Maintenance Ticket
                  </strong>
                  <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
                    Report plumbing, electrical, leakage, or cleaning issues
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--color-muted)" />
            </Link>

            <Link
              to="/resident/services"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-cream-soft)",
                border: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Sparkles size={18} color="var(--color-forest)" />
                <div>
                  <strong style={{ color: "var(--color-dark)", fontSize: "0.875rem", display: "block" }}>
                    Book Society Services
                  </strong>
                  <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
                    RO purifier service, housekeeping, pest control
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--color-muted)" />
            </Link>

            <Link
              to="/resident/clubhouse"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-cream-soft)",
                border: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <BookmarkCheck size={18} color="var(--color-forest)" />
                <div>
                  <strong style={{ color: "var(--color-dark)", fontSize: "0.875rem", display: "block" }}>
                    Reserve Clubhouse Amenities
                  </strong>
                  <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
                    Badminton court, banquet hall, indoor games
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--color-muted)" />
            </Link>

            <Link
              to="/resident/events"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-cream-soft)",
                border: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CalendarDays size={18} color="var(--color-forest)" />
                <div>
                  <strong style={{ color: "var(--color-dark)", fontSize: "0.875rem", display: "block" }}>
                    Community Celebrations & RSVPs
                  </strong>
                  <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
                    Festival gatherings, sports tournaments & meetings
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--color-muted)" />
            </Link>
          </div>
        </div>

        {/* Latest Notices */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Society Notices & Circulars</h3>
              <p className="card-subtitle">Official communications from RWA management</p>
            </div>
            <Link to="/resident/announcements" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          {announcements.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", padding: "1.5rem 0", textAlign: "center" }}>
              No active circulars at this time.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {announcements.map((item) => (
                <div
                  key={item.announcement_id}
                  style={{
                    padding: "0.85rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-cream-soft)",
                    border: "1px solid var(--color-border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <strong style={{ fontSize: "0.875rem", color: "var(--color-dark)" }}>{item.title}</strong>
                    <span
                      className={`badge ${
                        item.category === "EMERGENCY"
                          ? "badge-danger"
                          : item.category === "SECURITY"
                          ? "badge-warning"
                          : "badge-info"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.35rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
                    {formatDate(item.published_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
