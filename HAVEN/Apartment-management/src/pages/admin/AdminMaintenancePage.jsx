import React, { useState, useEffect } from "react";
import { Wrench, UserCheck, Calendar } from "lucide-react";
import { getAdminMaintenance, getAdminStaff, assignMaintenance } from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatDate } from "../../utils/formatters";

export const AdminMaintenancePage = () => {
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [maintData, staffData] = await Promise.all([
        getAdminMaintenance(),
        getAdminStaff()
      ]);
      setRequests(maintData || []);
      setStaffList((staffData || []).filter((s) => s.staff_status === "ACTIVE"));
    } catch (err) {
      console.error("Failed to load maintenance data:", err);
      setError("Failed to fetch maintenance requests or active staff members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = (request) => {
    setSelectedRequest(request);
    setSelectedStaffId(request.assigned_staff_id ? String(request.assigned_staff_id) : "");
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedStaffId) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await assignMaintenance(selectedRequest.request_id, Number(selectedStaffId));
      const assignedPerson = staffList.find((s) => String(s.staff_id) === String(selectedStaffId));
      setSuccess(
        `Ticket #${selectedRequest.request_id} assigned to ${assignedPerson ? assignedPerson.full_name : "staff"} successfully.`
      );
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to assign maintenance:", err);
      setError(err.response?.data?.message || "Failed to assign staff technician.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Ticket ID & Category",
      key: "request_id",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>
            #{row.request_id} — {row.category}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
            Priority: <Badge status={row.priority} />
          </div>
        </div>
      )
    },
    {
      header: "Resident",
      key: "resident_name",
      render: (row) => (
        <span style={{ fontWeight: 500, color: "var(--color-dark)" }}>
          {row.resident_name || `Resident #${row.resident_id}`}
        </span>
      )
    },
    {
      header: "Issue Description",
      key: "description",
      render: (row) => (
        <p style={{ maxWidth: "260px", fontSize: "0.85rem", color: "var(--color-dark)", wordBreak: "break-word" }}>
          {row.description}
        </p>
      )
    },
    {
      header: "Assigned Technician",
      key: "staff_name",
      render: (row) =>
        row.staff_name ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-forest)" }}>
            <UserCheck size={15} />
            <span style={{ fontWeight: 500 }}>{row.staff_name}</span>
          </div>
        ) : (
          <span style={{ color: "var(--color-brick)", fontSize: "0.825rem", fontStyle: "italic" }}>
            Unassigned
          </span>
        )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => <Badge status={row.status} />
    },
    {
      header: "Logged On",
      key: "request_date",
      render: (row) => (
        <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
          {formatDate(row.request_date)}
        </span>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleOpenAssign(row)}
          disabled={row.status === "COMPLETED"}
        >
          <UserCheck size={13} />
          <span>{row.assigned_staff_id ? "Reassign" : "Assign Technician"}</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society Maintenance Tickets</h2>
          <p className="card-subtitle">Review resident repair complaints, prioritize urgency, and assign society technicians</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          searchPlaceholder="Search category, resident, technician, description..."
          searchFields={["category", "resident_name", "staff_name", "description", "priority"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Completed", value: "COMPLETED" }
          ]}
          filterKey="status"
          emptyTitle="No maintenance tickets"
          emptyMessage="No maintenance requests currently recorded in the system."
        />
      </div>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Technician to Ticket #${selectedRequest?.request_id}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="assign-staff-form"
              className="btn btn-primary"
              disabled={submitting || !selectedStaffId}
            >
              {submitting ? "Assigning..." : "Confirm Assignment"}
            </button>
          </>
        }
      >
        <form id="assign-staff-form" onSubmit={handleAssignSubmit}>
          <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "var(--color-cream-soft)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>
              <strong>Category:</strong> {selectedRequest?.category} | <strong>Priority:</strong> {selectedRequest?.priority}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
              "{selectedRequest?.description}"
            </p>
          </div>

          <div className="form-group">
            <label className="form-label required">Select Active Technician</label>
            <select
              className="form-select"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              required
            >
              <option value="">-- Choose Society Technician --</option>
              {staffList.map((st) => (
                <option key={st.staff_id} value={st.staff_id}>
                  {st.full_name} ({st.department || "General"}) — @{st.username}
                </option>
              ))}
            </select>
            <span className="form-hint">
              Assigning a technician automatically sets ticket status to <strong>IN_PROGRESS</strong>.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
