import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Building,
  Users,
  UserCheck,
  Wrench,
  Sparkles,
  ClipboardList,
  CalendarDays,
  BookmarkCheck,
  Bell,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { getAdminDashboard } from "../../api/admin";
import { StatCard } from "../../components/common/StatCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin dashboard stats:", err);
      setError("Failed to load dashboard metrics from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) {
    return <LoadingSpinner message="Loading administrative dashboard..." />;
  }

  const totalApartments = stats?.totalApartments || 0;
  const vacantApartments = stats?.vacantApartments || 0;
  const occupiedApartments = Math.max(0, totalApartments - vacantApartments);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Banner / Header */}
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
          gap: "1rem"
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-sage)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            CENTRAL ADMINISTRATION
          </span>
          <h2 style={{ color: "var(--color-white)", fontSize: "1.75rem", marginTop: "0.25rem" }}>
            Welcome to HAVEN Management Console
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", marginTop: "0.25rem", maxWidth: "600px", fontSize: "0.9rem" }}>
            Monitor real-time residential statistics, pending maintenance operations, facility reservations, and community staff.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="btn btn-secondary btn-sm"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", color: "var(--color-white)", borderColor: "rgba(255, 255, 255, 0.3)" }}
        >
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      {/* Primary Statistics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem"
        }}
      >
        <StatCard
          title="Total Apartments"
          value={totalApartments}
          icon={Building}
          subtitle={`${occupiedApartments} Occupied (${totalApartments > 0 ? Math.round((occupiedApartments / totalApartments) * 100) : 0}% occupancy)`}
        />

        <StatCard
          title="Vacant Units"
          value={vacantApartments}
          icon={Building2}
          subtitle="Available for resident registration"
          badge="Vacant"
        />

        <StatCard
          title="Active Residents"
          value={stats?.activeResidents ?? 0}
          icon={Users}
          subtitle="Registered resident accounts"
        />

        <StatCard
          title="Active Staff"
          value={stats?.activeStaff ?? 0}
          icon={UserCheck}
          subtitle="Maintenance and service staff"
        />
      </div>

      {/* Operational Backlog Statistics Grid */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: "0.5rem" }}>
        Action Items & Operational Backlog
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem"
        }}
      >
        <StatCard
          title="Open Maintenance"
          value={stats?.openMaintenance ?? 0}
          icon={Wrench}
          subtitle="Pending or In Progress repairs"
          badge={stats?.openMaintenance > 0 ? "Needs Review" : "Clear"}
        />

        <StatCard
          title="Pending Services"
          value={stats?.pendingServiceRequests ?? 0}
          icon={ClipboardList}
          subtitle="Community service bookings"
        />

        <StatCard
          title="Clubhouse Requests"
          value={stats?.pendingClubhouseBookings ?? 0}
          icon={BookmarkCheck}
          subtitle="Facility bookings awaiting review"
        />

        <StatCard
          title="Upcoming Events"
          value={stats?.upcomingEvents ?? 0}
          icon={CalendarDays}
          subtitle="Scheduled community gatherings"
        />
      </div>

      {/* Quick Access Action Cards */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Quick Management Shortcuts</h3>
            <p className="card-subtitle">Direct access to primary administrative workflows</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem"
          }}
        >
          <Link
            to="/admin/apartments"
            style={{
              padding: "1.25rem",
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
              <Building size={20} color="var(--color-forest)" />
              <div>
                <strong style={{ display: "block", color: "var(--color-dark)", fontSize: "0.9rem" }}>Manage Apartments</strong>
                <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>Add units, update status</span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--color-muted)" />
          </Link>

          <Link
            to="/admin/maintenance"
            style={{
              padding: "1.25rem",
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
              <Wrench size={20} color="var(--color-forest)" />
              <div>
                <strong style={{ display: "block", color: "var(--color-dark)", fontSize: "0.9rem" }}>Assign Maintenance</strong>
                <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>Delegate work to staff</span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--color-muted)" />
          </Link>

          <Link
            to="/admin/clubhouse-bookings"
            style={{
              padding: "1.25rem",
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
              <BookmarkCheck size={20} color="var(--color-forest)" />
              <div>
                <strong style={{ display: "block", color: "var(--color-dark)", fontSize: "0.9rem" }}>Clubhouse Bookings</strong>
                <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>Approve or reject reservations</span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--color-muted)" />
          </Link>

          <Link
            to="/admin/announcements"
            style={{
              padding: "1.25rem",
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
              <Bell size={20} color="var(--color-forest)" />
              <div>
                <strong style={{ display: "block", color: "var(--color-dark)", fontSize: "0.9rem" }}>Broadcast Notice</strong>
                <span style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>Post community announcements</span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--color-muted)" />
          </Link>
        </div>
      </div>
    </div>
  );
};
