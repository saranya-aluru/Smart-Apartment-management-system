import React, { useState, useEffect } from "react";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Building,
  User,
  ArrowRight,
  Filter,
  Check,
  PlayCircle
} from "lucide-react";
import { getStaffMaintenance, updateStaffMaintenanceStatus } from "../../api/staff";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { formatDateTime } from "../../utils/formatters";

export const StaffMaintenancePage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Status Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalStatus, setModalStatus] = useState("IN_PROGRESS");
  const [submittingModal, setSubmittingModal] = useState(false);

  // Manual Quick ID Update State
  const [manualId, setManualId] = useState("");
  const [manualStatus, setManualStatus] = useState("IN_PROGRESS");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchTickets = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const data = await getStaffMaintenance();
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load staff maintenance work orders:", err);
      setError("Unable to load assigned repair requests from server. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Quick 1-click update (e.g. Start Work or Complete)
  const handleQuickStatusUpdate = async (id, nextStatus) => {
    setUpdatingId(id);
    setError("");
    setSuccess("");
    try {
      await updateStaffMaintenanceStatus(id, nextStatus);
      const actionLabel = nextStatus === "IN_PROGRESS" ? "marked as IN PROGRESS" : "marked as COMPLETED";
      setSuccess(`Work Order #${id} successfully ${actionLabel}.`);
      await fetchTickets(true);
    } catch (err) {
      console.error("Failed to update status:", err);
      const msg = err.response?.data?.message || `Failed to update work order #${id}.`;
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Modal Status Update
  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setModalStatus(ticket.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED");
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingModal(true);
    setError("");
    setSuccess("");
    try {
      await updateStaffMaintenanceStatus(selectedTicket.request_id, modalStatus);
      setSuccess(`Work Order #${selectedTicket.request_id} updated to ${modalStatus}.`);
      setSelectedTicket(null);
      await fetchTickets(true);
    } catch (err) {
      console.error("Modal status update error:", err);
      setError(err.response?.data?.message || "Failed to update work order status.");
    } finally {
      setSubmittingModal(false);
    }
  };

  // Manual ID Form Submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId || isNaN(Number(manualId))) {
      setError("Please enter a valid numeric Request ID.");
      return;
    }

    setManualSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await updateStaffMaintenanceStatus(Number(manualId), manualStatus);
      setSuccess(`Work Order #${manualId} status updated to ${manualStatus}.`);
      setManualId("");
      await fetchTickets(true);
    } catch (err) {
      console.error("Manual update error:", err);
      const msg =
        err.response?.status === 404
          ? `Work Order #${manualId} was not found or is not assigned to you.`
          : err.response?.data?.message || "Failed to update status.";
      setError(msg);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Computed Metrics
  const totalAssigned = requests.length;
  const inProgressCount = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;

  const columns = [
    {
      header: "Ticket ID & Category",
      key: "request_id",
      render: (row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontWeight: 700, color: "var(--color-dark)" }}>#{row.request_id}</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-forest)" }}>
              {row.category}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "2px" }}>
            Priority: <Badge status={row.priority} />
          </div>
        </div>
      )
    },
    {
      header: "Flat / Tower",
      key: "apartment_number",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
          <Building size={14} color="var(--color-muted)" />
          <div>
            <strong style={{ color: "var(--color-dark)" }}>Flat {row.apartment_number || "—"}</strong>
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
              {row.building || "Main Tower"}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Resident Contact",
      key: "resident_name",
      render: (row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem", fontWeight: 500, color: "var(--color-dark)" }}>
            <User size={13} color="var(--color-muted)" />
            <span>{row.resident_name || `Resident #${row.resident_id}`}</span>
          </div>
          {row.resident_phone && (
            <a
              href={`tel:${row.resident_phone}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.775rem",
                color: "var(--color-forest)",
                marginTop: "2px",
                textDecoration: "none"
              }}
              title="Click to dial resident"
            >
              <Phone size={11} />
              <span>+91 {row.resident_phone}</span>
            </a>
          )}
        </div>
      )
    },
    {
      header: "Issue Description",
      key: "description",
      render: (row) => (
        <div style={{ maxWidth: "260px" }}>
          <p style={{ fontSize: "0.825rem", color: "var(--color-dark)", margin: 0, lineHeight: 1.4 }}>
            {row.description}
          </p>
          <div style={{ fontSize: "0.725rem", color: "var(--color-muted)", marginTop: "3px" }}>
            Reported: {formatDateTime(row.request_date)}
          </div>
          {row.completed_date && (
            <div style={{ fontSize: "0.725rem", color: "var(--color-forest)", marginTop: "1px" }}>
              Completed: {formatDateTime(row.completed_date)}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => <Badge status={row.status} />
    },
    {
      header: "Actions & Progress",
      key: "actions",
      render: (row) => {
        const isBusy = updatingId === row.request_id;

        return (
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            {row.status === "PENDING" && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleQuickStatusUpdate(row.request_id, "IN_PROGRESS")}
                disabled={isBusy}
                title="Start repairing this issue"
              >
                <PlayCircle size={13} />
                <span>Start Work</span>
              </button>
            )}

            {row.status === "IN_PROGRESS" && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleQuickStatusUpdate(row.request_id, "COMPLETED")}
                disabled={isBusy}
                style={{ backgroundColor: "var(--color-forest)", borderColor: "var(--color-forest)" }}
                title="Mark this repair completed"
              >
                <CheckCircle2 size={13} />
                <span>Mark Done</span>
              </button>
            )}

            {row.status === "COMPLETED" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.775rem",
                  color: "var(--color-forest)",
                  fontWeight: 600
                }}
              >
                <Check size={14} />
                Resolved
              </span>
            )}

            {/* Change Status Modal trigger */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleOpenModal(row)}
              disabled={isBusy}
              title="Change progress state"
            >
              Update
            </button>
          </div>
        );
      }
    }
  ];

  if (loading && requests.length === 0) {
    return <LoadingSpinner message="Loading assigned repair orders..." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div className="card-header">
        <div>
          <h2>Assigned Maintenance Work Orders</h2>
          <p className="card-subtitle">
            View active resident repair requests assigned to you, visit residences, and log completion progress
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fetchTickets(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? "spin" : ""} />
          <span>{refreshing ? "Refreshing..." : "Refresh List"}</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      {/* KPI Metric Summary Cards */}
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
              Total Assigned
            </span>
            <Wrench size={18} color="var(--color-forest)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-dark)", marginTop: "0.25rem" }}>
            {totalAssigned}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            All-time jobs allocated by admin
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              In Progress
            </span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#D97706", marginTop: "0.25rem" }}>
            {inProgressCount}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            Repairs currently underway
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              Pending Start
            </span>
            <AlertCircle size={18} color="var(--color-brick)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-brick)", marginTop: "0.25rem" }}>
            {pendingCount}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            Awaiting technician inspection
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
            {completedCount}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0, marginTop: "0.25rem" }}>
            Successfully resolved repairs
          </p>
        </div>
      </div>

      {/* Main Repair Work Orders Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Assigned Repair Orders</h3>
            <p className="card-subtitle">
              Click "Start Work" to begin or "Mark Done" once the repair is completed at the resident flat
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          searchPlaceholder="Search flat, resident, category, description..."
          searchFields={["request_id", "apartment_number", "building", "resident_name", "category", "description", "priority"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Completed", value: "COMPLETED" }
          ]}
          filterKey="status"
          emptyTitle="No repair requests assigned"
          emptyMessage="You currently have no maintenance work orders allocated to your profile."
        />
      </div>

      {/* Quick Status Updater Drawer / Card (Manual Entry Option) */}
      <div className="card" style={{ backgroundColor: "var(--color-cream-soft)" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-dark)", marginBottom: "0.5rem" }}>
          Direct Ticket Status Lookup
        </h4>
        <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginBottom: "1rem" }}>
          Have a printed job slip? Enter the ticket ID below to log execution progress directly.
        </p>

        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="form-group" style={{ minWidth: "160px", marginBottom: 0 }}>
            <label className="form-label required">Request ID</label>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="e.g. 2"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ minWidth: "220px", marginBottom: 0 }}>
            <label className="form-label required">Update Status To</label>
            <select
              className="form-select"
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value)}
              required
            >
              <option value="IN_PROGRESS">IN_PROGRESS (Currently Repairing)</option>
              <option value="COMPLETED">COMPLETED (Repair Completed)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={manualSubmitting || !manualId}
            style={{ marginBottom: "2px" }}
          >
            {manualSubmitting ? "Updating..." : "Submit Update"}
          </button>
        </form>
      </div>

      {/* Modal for Status Update */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Update Work Order #${selectedTicket?.request_id}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedTicket(null)}
              disabled={submittingModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="modal-status-form"
              className="btn btn-primary"
              disabled={submittingModal}
            >
              {submittingModal ? "Saving..." : "Save Status"}
            </button>
          </>
        }
      >
        {selectedTicket && (
          <form id="modal-status-form" onSubmit={handleModalSubmit}>
            <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "var(--color-cream-soft)", borderRadius: "var(--radius-sm)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-dark)", margin: 0 }}>
                <strong>Issue:</strong> {selectedTicket.category} • Flat {selectedTicket.apartment_number} ({selectedTicket.building})
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "4px", margin: 0 }}>
                "{selectedTicket.description}"
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--color-dark)", marginTop: "4px", margin: 0 }}>
                <strong>Resident:</strong> {selectedTicket.resident_name} {selectedTicket.resident_phone ? `(+91 ${selectedTicket.resident_phone})` : ""}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label required">Select Execution Status</label>
              <select
                className="form-select"
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
                required
              >
                <option value="IN_PROGRESS">IN_PROGRESS (Technician on site / repairing)</option>
                <option value="COMPLETED">COMPLETED (Repair finished and tested)</option>
              </select>
              <span className="form-hint">
                Marking as COMPLETED automatically records the completion timestamp.
              </span>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
