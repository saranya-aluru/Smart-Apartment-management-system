import React, { useState, useEffect } from "react";
import { Plus, Wrench, Calendar } from "lucide-react";
import { getResidentMaintenance, createResidentMaintenance } from "../../api/resident";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatDate } from "../../utils/formatters";

export const ResidentMaintenancePage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    category: "PLUMBING",
    priority: "MEDIUM",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getResidentMaintenance();
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load resident maintenance:", err);
      setError("Failed to fetch your maintenance requests from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenModal = () => {
    setForm({
      category: "PLUMBING",
      priority: "MEDIUM",
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createResidentMaintenance({
        category: form.category,
        priority: form.priority,
        description: form.description.trim()
      });
      setSuccess("Your maintenance complaint has been logged with society technicians.");
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error("Failed to submit request:", err);
      setError(err.response?.data?.message || "Failed to submit maintenance request.");
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
      header: "Issue Description",
      key: "description",
      render: (row) => (
        <p style={{ maxWidth: "340px", fontSize: "0.85rem", color: "var(--color-dark)" }}>
          {row.description}
        </p>
      )
    },
    {
      header: "Logged On",
      key: "request_date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.825rem", color: "var(--color-muted)" }}>
          <Calendar size={13} />
          <span>{formatDate(row.request_date)}</span>
        </div>
      )
    },
    {
      header: "Completed Date",
      key: "completed_date",
      render: (row) => (
        <span style={{ fontSize: "0.825rem", color: "var(--color-muted)" }}>
          {row.completed_date ? formatDate(row.completed_date) : "Pending resolution"}
        </span>
      )
    },
    {
      header: "Current Status",
      key: "status",
      render: (row) => <Badge status={row.status} />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Flat Maintenance & Repair Tickets</h2>
          <p className="card-subtitle">Log repair tickets for your flat and monitor society technician resolution</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={16} />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          searchPlaceholder="Search category, description..."
          searchFields={["category", "description", "priority"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Rejected", value: "REJECTED" }
          ]}
          filterKey="status"
          emptyTitle="No maintenance tickets"
          emptyMessage="You have not submitted any maintenance requests yet."
        />
      </div>

      {/* New Maintenance Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Maintenance Ticket"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-maint-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </>
        }
      >
        <form id="new-maint-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="PLUMBING">Plumbing (Tap leakage, geyser, bathroom pipes)</option>
                <option value="ELECTRICAL">Electrical (Switchboard, tripping MCB, fan, lights)</option>
                <option value="CLEANING">Cleaning & Waste Collection</option>
                <option value="SECURITY">Door Locks & Intercom</option>
                <option value="OTHER">Other Household Repairs</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Urgency / Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                required
              >
                <option value="LOW">Low (Routine Checkup)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Major Leakage / Outage)</option>
                <option value="URGENT">Urgent (Immediate Electrical/Water Hazard)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Issue Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the complaint in detail (e.g. Geyser valve water dripping continuously in master bathroom)..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
