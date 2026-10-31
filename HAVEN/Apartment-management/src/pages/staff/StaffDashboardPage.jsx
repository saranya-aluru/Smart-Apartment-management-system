import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  CheckCircle2,
  Clock,
  Bell,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Phone,
  Building,
  User,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStaffMaintenance, updateStaffMaintenanceStatus } from "../../api/staff";
import { getPublicAnnouncements, getPublicEvents } from "../../api/shared";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { formatDateTime } from "../../utils/formatters";

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Ticket Update State
  const [requestId, setRequestId] = useState("");
  const [nextStatus, setNextStatus] = useState("IN_PROGRESS");
  const [updating, setUpdating] = useState(false);
  const [rowUpdatingId, setRowUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tickets, notices, evs] = await Promise.all([
        getStaffMaintenance().catch(() => []),
        getPublicAnnouncements().catch(() => []),
        getPublicEvents().catch(() => [])
      ]);
      setMaintenanceTickets(tickets || []);
      setAnnouncements(notices ? notices.slice(0, 3) : []);
      setEvents(evs ? evs.slice(0, 3) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Quick update from active table row
  const handleQuickStatusUpdate = async (id, status) => {
    setRowUpdatingId(id);
    setError("");
    setSuccess("");
    try {
      await updateStaffMaintenanceStatus(id, status);
      const actionName = status === "IN_PROGRESS" ? "marked as IN PROGRESS" : "marked as COMPLETED";
      setSuccess(`Work Order #${id} successfully ${actionName}.`);
      // Reload tickets
      const updated = await getStaffMaintenance();
      setMaintenanceTickets(updated || []);
    } catch (err) {
      console.error("Staff row update error:", err);
      setError(err.response?.data?.message || `Failed to update work order #${id}.`);
    } finally {
      setRowUpdatingId(null);
    }
  };

  // Manual Form Submit
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!requestId || isNaN(Number(requestId))) {
      setError("Please enter a valid numeric Request ID.");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");
    try {
      await updateStaffMaintenanceStatus(Number(requestId), nextStatus);
      setSuccess(`Request #${requestId} status successfully updated to ${nextStatus}.`);
      setRequestId("");
      const updated = await getStaffMaintenance();
      setMaintenanceTickets(updated || []);
    } catch (err) {
      console.error("Staff update error:", err);
      const msg =
        err.response?.status === 404
          ? `Request #${requestId} was either not found or is not assigned to your staff profile.`
          : err.response?.data?.message || "Failed to update maintenance request.";
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  // Metrics
  const activeTickets = maintenanceTickets.filter((t) => t.status !== "COMPLETED");
  const inProgressTickets = maintenanceTickets.filter((t) => t.status === "IN_PROGRESS");
  const pendingTickets = maintenanceTickets.filter((t) => t.status === "PENDING");
  const completedTickets = maintenanceTickets.filter((t) => t.status === "COMPLETED");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Staff Welcome Banner */}
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
            STAFF OPERATIONS CONSOLE • HAVEN RESIDENCY
          </span>
          <h2 style={{ color: "var(--color-white)", fontSize: "1.75rem", marginTop: "0.25rem" }}>
            Hello, {user?.username || "Staff Member"}!
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.85)", marginTop: "0.3rem", fontSize: "0.9rem" }}>
            Technician & Facilities Management Portal • Role: {user?.role}
          </p>
        </div>

        <Link
          to="/staff/maintenance"
          className="btn btn-secondary"
          style={{ backgroundColor: "var(--color-white)", color: "var(--color-forest)", borderColor: "transparent", fontWeight: 600 }}
        >
          <Wrench size={16} />
          <span>View All Work Orders ({maintenanceTickets.length})</span>
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      {/* KPI Metric Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}
      >
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Active Jobs
            </span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#D97706", marginTop: "0.25rem" }}>
            {activeTickets.length}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            {inProgressTickets.length} in progress, {pendingTickets.length} pending start
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              In Progress
            </span>
            <Wrench size={18} color="var(--color-forest)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-forest)", marginTop: "0.25rem" }}>
            {inProgressTickets.length}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            Repairs currently under repair
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Completed
            </span>
            <CheckCircle2 size={18} color="var(--color-forest)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-forest)", marginTop: "0.25rem" }}>
            {completedTickets.length}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            Resolved work orders
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Total Assigned
            </span>
            <ShieldCheck size={18} color="var(--color-dark)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-dark)", marginTop: "0.25rem" }}>
            {maintenanceTickets.length}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            All-time tasks allocated by admin
          </p>
        </div>
      </div>

      {/* Priority Work Orders Requiring Action */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Priority Work Orders Requiring Action</h3>
            <p className="card-subtitle">
              Live resident repair requests assigned to you that need immediate execution or status update
            </p>
          </div>
          <Link to="/staff/maintenance" className="btn btn-secondary btn-sm">
            <span>View All ({maintenanceTickets.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {activeTickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
            <CheckCircle2 size={40} color="var(--color-forest)" style={{ marginBottom: "0.75rem" }} />
            <h4 style={{ color: "var(--color-dark)", margin: "0 0 0.25rem 0" }}>All Caught Up!</h4>
            <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto" }}>
              You have no active pending work orders right now. Good job keeping HAVEN residents comfortable!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {activeTickets.slice(0, 5).map((ticket) => {
              const isRowBusy = rowUpdatingId === ticket.request_id;

              return (
                <div
                  key={ticket.request_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "1rem",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--color-dark)" }}>#{ticket.request_id}</span>
                      <strong style={{ color: "var(--color-forest)", fontSize: "0.9rem" }}>{ticket.category}</strong>
                      <Badge status={ticket.priority} />
                      <Badge status={ticket.status} />
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--color-dark)", margin: 0 }}>
                      "{ticket.description}"
                    </p>

                    <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.775rem", color: "var(--color-muted)", flexWrap: "wrap", marginTop: "2px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Building size={12} />
                        Flat {ticket.apartment_number} ({ticket.building || "Main Tower"})
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <User size={12} />
                        {ticket.resident_name}
                      </span>
                      {ticket.resident_phone && (
                        <a
                          href={`tel:${ticket.resident_phone}`}
                          style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-forest)", textDecoration: "none" }}
                        >
                          <Phone size={12} />
                          +91 {ticket.resident_phone}
                        </a>
                      )}
                      <span>Reported: {formatDateTime(ticket.request_date)}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {ticket.status === "PENDING" && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleQuickStatusUpdate(ticket.request_id, "IN_PROGRESS")}
                        disabled={isRowBusy}
                      >
                        <PlayCircle size={14} />
                        <span>Start Work</span>
                      </button>
                    )}

                    {ticket.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleQuickStatusUpdate(ticket.request_id, "COMPLETED")}
                        disabled={isRowBusy}
                        style={{ backgroundColor: "var(--color-forest)", borderColor: "var(--color-forest)" }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Done</span>
                      </button>
                    )}

                    <Link
                      to="/staff/maintenance"
                      className="btn btn-secondary btn-sm"
                      title="Open full maintenance table"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action: Work Order Status Lookup / Updater */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Manual Work Order Status Updater</h3>
            <p className="card-subtitle">
              Enter any assigned Request ID to log execution progress (PUT /api/staff/maintenance/&#123;id&#125;/status)
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateTicket} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="form-group" style={{ minWidth: "160px", marginBottom: 0 }}>
            <label className="form-label required">Request ID</label>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="e.g. 2"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ minWidth: "220px", marginBottom: 0 }}>
            <label className="form-label required">Target Status</label>
            <select
              className="form-select"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              required
            >
              <option value="IN_PROGRESS">IN_PROGRESS (Technician on site)</option>
              <option value="COMPLETED">COMPLETED (Repair finished)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={updating || !requestId}
            style={{ marginBottom: "2px" }}
          >
            {updating ? "Updating..." : "Update Ticket Status"}
          </button>
        </form>
      </div>

      {/* Community Bulletin & Operational Updates */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {/* Building Notices */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Building Notices</h3>
              <p className="card-subtitle">Society broadcasts affecting operations</p>
            </div>
            <Link to="/staff/bulletin" className="btn btn-secondary btn-sm">
              All Notices
            </Link>
          </div>

          {announcements.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem" }}>
              No current announcements.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {announcements.map((item) => (
                <div
                  key={item.announcement_id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>{item.title}</strong>
                    <span className="badge badge-info">{item.category}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Society Gatherings */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Upcoming Gatherings</h3>
              <p className="card-subtitle">Society schedule & venue arrangements</p>
            </div>
          </div>

          {events.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem" }}>
              No upcoming events scheduled.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {events.map((ev) => (
                <div
                  key={ev.event_id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)"
                  }}
                >
                  <strong style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>{ev.title}</strong>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.775rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
                    <span>{ev.event_date}</span>
                    <span>{ev.venue || "Clubhouse"}</span>
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
