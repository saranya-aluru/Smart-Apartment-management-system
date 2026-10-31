import React, { useState, useEffect } from "react";
import { Plus, Bell, AlertTriangle, ShieldAlert, Calendar } from "lucide-react";
import {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncementStatus
} from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatDate } from "../../utils/formatters";

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    status: "PUBLISHED"
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setError("Failed to fetch announcements from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      title: "",
      description: "",
      category: "GENERAL",
      status: "PUBLISHED"
    });
    setIsAddModalOpen(true);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createAnnouncement({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        status: form.status
      });
      setSuccess(`Announcement "${form.title}" broadcasted successfully.`);
      setIsAddModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError(err.response?.data?.message || "Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updateAnnouncementStatus(id, nextStatus);
      setSuccess(`Announcement status updated to ${nextStatus}.`);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to change status:", err);
      setError(err.response?.data?.message || "Failed to update announcement status.");
    }
  };

  const columns = [
    {
      header: "Title & Author",
      key: "title",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>{row.title}</div>
          <div style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
            RWA Notice by @{row.author || "Admin"}
          </div>
        </div>
      )
    },
    {
      header: "Category",
      key: "category",
      render: (row) => (
        <span
          className={`badge ${
            row.category === "EMERGENCY"
              ? "badge-danger"
              : row.category === "SECURITY"
              ? "badge-warning"
              : "badge-info"
          }`}
        >
          {row.category}
        </span>
      )
    },
    {
      header: "Notice Description",
      key: "description",
      render: (row) => (
        <p style={{ maxWidth: "340px", fontSize: "0.85rem", color: "var(--color-dark)", wordBreak: "break-word" }}>
          {row.description}
        </p>
      )
    },
    {
      header: "Published On",
      key: "published_date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.825rem", color: "var(--color-muted)" }}>
          <Calendar size={13} />
          <span>{formatDate(row.published_date)}</span>
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => <Badge status={row.status} />
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {row.status !== "PUBLISHED" && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange(row.announcement_id, "PUBLISHED")}
            >
              Publish
            </button>
          )}

          {row.status === "PUBLISHED" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange(row.announcement_id, "ARCHIVED")}
            >
              Archive
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society Notices & Circulars</h2>
          <p className="card-subtitle">Broadcast building updates, DG power backup alerts, emergency circulars, and RWA notices</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Broadcast Notice</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={announcements}
          loading={loading}
          searchPlaceholder="Search notice title, category, description..."
          searchFields={["title", "category", "description", "author"]}
          filterOptions={[
            { label: "Published", value: "PUBLISHED" },
            { label: "Draft", value: "DRAFT" },
            { label: "Archived", value: "ARCHIVED" }
          ]}
          filterKey="status"
          emptyTitle="No announcements found"
          emptyMessage="No notices have been posted yet. Click 'Broadcast Notice' to share one with all residents."
        />
      </div>

      {/* Add Announcement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Broadcast Society Notice"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-announcement-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Broadcasting..." : "Broadcast Notice"}
            </button>
          </>
        }
      >
        <form id="add-announcement-form" onSubmit={handleCreateAnnouncement}>
          <div className="form-group">
            <label className="form-label required">Notice Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lift Servicing Schedule & DG Backup Notice"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="GENERAL">General Society Notice</option>
                <option value="MAINTENANCE">Maintenance & Water Outage</option>
                <option value="SECURITY">Security / Visitor Policy</option>
                <option value="PAYMENT">RWA Maintenance Dues</option>
                <option value="EMERGENCY">Emergency Alert</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="PUBLISHED">Published (Visible immediately)</option>
                <option value="DRAFT">Draft (Save for later)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Circular Description</label>
            <textarea
              className="form-textarea"
              placeholder="Full text of the society circular for all residents..."
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
