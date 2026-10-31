import React, { useState, useEffect } from "react";
import { Plus, Home, MapPin, Users, Clock } from "lucide-react";
import {
  getAdminClubhouseFacilities,
  createClubhouseFacility,
  updateClubhouseFacilityStatus
} from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatCurrency } from "../../utils/formatters";

export const AdminClubhouseFacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: 25,
    location: "Clubhouse Complex",
    hourlyCharge: 300,
    openingTime: "06:00:00",
    closingTime: "22:00:00"
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminClubhouseFacilities();
      setFacilities(data || []);
    } catch (err) {
      console.error("Failed to load facilities:", err);
      setError("Failed to fetch clubhouse facilities from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      name: "",
      description: "",
      capacity: 25,
      location: "Clubhouse Complex",
      hourlyCharge: 300,
      openingTime: "06:00:00",
      closingTime: "22:00:00"
    });
    setIsAddModalOpen(true);
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createClubhouseFacility({
        name: form.name.trim(),
        description: form.description.trim(),
        capacity: Number(form.capacity),
        location: form.location.trim(),
        hourlyCharge: Number(form.hourlyCharge),
        openingTime: form.openingTime,
        closingTime: form.closingTime
      });
      setSuccess(`Facility "${form.name}" created successfully.`);
      setIsAddModalOpen(false);
      fetchFacilities();
    } catch (err) {
      console.error("Failed to create facility:", err);
      setError(err.response?.data?.message || "Failed to create clubhouse facility.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (fac) => {
    const nextStatus = fac.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    try {
      await updateClubhouseFacilityStatus(fac.clubhouse_id, nextStatus);
      setSuccess(`Facility "${fac.name}" status updated to ${nextStatus}.`);
      fetchFacilities();
    } catch (err) {
      console.error("Failed to change status:", err);
      setError(err.response?.data?.message || "Failed to update facility status.");
    }
  };

  const columns = [
    {
      header: "Facility Name",
      key: "name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Home size={16} color="var(--color-forest)" />
          <strong>{row.name}</strong>
        </div>
      )
    },
    {
      header: "Location",
      key: "location",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
          <MapPin size={13} color="var(--color-muted)" />
          <span>{row.location || "Clubhouse"}</span>
        </div>
      )
    },
    {
      header: "Max Capacity",
      key: "capacity",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
          <Users size={13} color="var(--color-muted)" />
          <span>Up to {row.capacity} residents</span>
        </div>
      )
    },
    {
      header: "Tariff / Rate (₹)",
      key: "hourly_charge",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--color-forest)" }}>
          {formatCurrency(row.hourly_charge)}/hr
        </span>
      )
    },
    {
      header: "Timings",
      key: "opening_time",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--color-muted)" }}>
          <Clock size={13} />
          <span>{row.opening_time?.slice(0, 5)} - {row.closing_time?.slice(0, 5)}</span>
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => <Badge status={row.status} />
    },
    {
      header: "Action",
      key: "actions",
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleToggleStatus(row)}
        >
          {row.status === "AVAILABLE" ? "Set Unavailable" : "Set Available"}
        </button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Clubhouse Facilities & Amenities</h2>
          <p className="card-subtitle">Manage recreational society amenities, guest capacities, and booking rates in ₹ (INR)</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Facility</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={facilities}
          loading={loading}
          searchPlaceholder="Search facility name or location..."
          searchFields={["name", "location", "description"]}
          filterOptions={[
            { label: "Available", value: "AVAILABLE" },
            { label: "Unavailable", value: "UNAVAILABLE" }
          ]}
          filterKey="status"
          emptyTitle="No facilities found"
          emptyMessage="No clubhouse facilities are registered yet."
        />
      </div>

      {/* Add Facility Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Clubhouse Facility"
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
              form="add-facility-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Save Facility"}
            </button>
          </>
        }
      >
        <form id="add-facility-form" onSubmit={handleCreateFacility}>
          <div className="form-group">
            <label className="form-label required">Facility Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Indoor Badminton Court 1, Swimming Pool, Banquet Hall"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Max Capacity (Guests)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Hourly Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={form.hourlyCharge}
                onChange={(e) => setForm({ ...form, hourlyCharge: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Location / Block</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ground Floor, Sports Complex, Tower B"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Opening Time</label>
              <input
                type="time"
                step="1"
                className="form-input"
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Closing Time</label>
              <input
                type="time"
                step="1"
                className="form-input"
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Society Rules</label>
            <textarea
              className="form-textarea"
              placeholder="Facility features, equipment provided, and usage policy..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
