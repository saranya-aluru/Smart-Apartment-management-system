import React, { useState, useEffect } from "react";
import { Plus, Edit2, Building } from "lucide-react";
import {
  getApartments,
  createApartment,
  updateApartment,
  updateApartmentStatus
} from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";

export const ApartmentsPage = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);

  const [form, setForm] = useState({
    apartmentNumber: "",
    building: "Tower A",
    floor: 1,
    bedrooms: 2,
    areaSqft: 1150,
    status: "VACANT"
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchApartments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getApartments();
      setApartments(data || []);
    } catch (err) {
      console.error("Failed to load apartments:", err);
      setError("Failed to fetch apartment inventory from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      apartmentNumber: "",
      building: "Tower A",
      floor: 1,
      bedrooms: 2,
      areaSqft: 1150,
      status: "VACANT"
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (apt) => {
    setSelectedApartment(apt);
    setForm({
      apartmentNumber: apt.apartment_number,
      building: apt.building,
      floor: apt.floor,
      bedrooms: apt.bedrooms,
      areaSqft: apt.area_sqft,
      status: apt.status
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createApartment({
        apartmentNumber: form.apartmentNumber.trim(),
        building: form.building.trim(),
        floor: Number(form.floor),
        bedrooms: Number(form.bedrooms),
        areaSqft: Number(form.areaSqft),
        status: form.status
      });
      setSuccess(`Flat ${form.apartmentNumber} successfully added to society records.`);
      setIsAddModalOpen(false);
      fetchApartments();
    } catch (err) {
      console.error("Failed to create apartment:", err);
      setError(err.response?.data?.message || "Failed to add apartment flat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApartment) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await updateApartment(selectedApartment.apartment_id, {
        apartmentNumber: form.apartmentNumber.trim(),
        building: form.building.trim(),
        floor: Number(form.floor),
        bedrooms: Number(form.bedrooms),
        areaSqft: Number(form.areaSqft)
      });

      if (form.status !== selectedApartment.status) {
        await updateApartmentStatus(selectedApartment.apartment_id, form.status);
      }

      setSuccess(`Flat ${form.apartmentNumber} updated successfully.`);
      setIsEditModalOpen(false);
      fetchApartments();
    } catch (err) {
      console.error("Failed to update flat:", err);
      setError(err.response?.data?.message || "Failed to update flat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (apt, newStatus) => {
    try {
      await updateApartmentStatus(apt.apartment_id, newStatus);
      setSuccess(`Flat ${apt.apartment_number} status updated to ${newStatus}.`);
      fetchApartments();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const columns = [
    {
      header: "Flat No.",
      key: "apartment_number",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Building size={16} color="var(--color-forest)" />
          <strong>Flat {row.apartment_number}</strong>
        </div>
      )
    },
    {
      header: "Tower / Block",
      key: "building"
    },
    {
      header: "Floor",
      key: "floor",
      render: (row) => `Floor ${row.floor}`
    },
    {
      header: "Configuration",
      key: "bedrooms",
      render: (row) => <strong>{row.bedrooms} BHK</strong>
    },
    {
      header: "Super Built-up Area",
      key: "area_sqft",
      render: (row) => `${row.area_sqft} sq ft`
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit flat details"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>

          {row.status === "VACANT" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickStatusChange(row, "MAINTENANCE")}
              title="Mark for maintenance"
            >
              Set Maint.
            </button>
          )}

          {row.status === "MAINTENANCE" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickStatusChange(row, "VACANT")}
              title="Mark as vacant"
            >
              Set Vacant
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
          <h2>Society Flat Inventory</h2>
          <p className="card-subtitle">Manage residential towers, flat configurations (BHK), super built-up areas, and occupancy</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Flat Unit</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={apartments}
          loading={loading}
          searchPlaceholder="Search flat number, tower, floor..."
          searchFields={["apartment_number", "building"]}
          filterOptions={[
            { label: "Vacant", value: "VACANT" },
            { label: "Occupied", value: "OCCUPIED" },
            { label: "Maintenance", value: "MAINTENANCE" }
          ]}
          filterKey="status"
          emptyTitle="No flats found"
          emptyMessage="No flats currently match the selected filter."
        />
      </div>

      {/* Add Apartment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Flat Unit to Society"
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
              form="add-apartment-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Create Flat"}
            </button>
          </>
        }
      >
        <form id="add-apartment-form" onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Flat Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A-301 or 1204"
                value={form.apartmentNumber}
                onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Tower / Block</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tower A, Block B, Wing C"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Floor</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Configuration (BHK)</label>
              <input
                type="number"
                min="1"
                max="6"
                className="form-input"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Super Built-up Area (Sq Ft)</label>
              <input
                type="number"
                min="100"
                step="1"
                className="form-input"
                value={form.areaSqft}
                onChange={(e) => setForm({ ...form, areaSqft: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Occupancy Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="VACANT">Vacant</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Apartment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Flat ${selectedApartment?.apartment_number}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-apartment-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="edit-apartment-form" onSubmit={handleUpdate}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Flat Number</label>
              <input
                type="text"
                className="form-input"
                value={form.apartmentNumber}
                onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Tower / Block</label>
              <input
                type="text"
                className="form-input"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Floor</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Configuration (BHK)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Super Built-up Area (Sq Ft)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={form.areaSqft}
                onChange={(e) => setForm({ ...form, areaSqft: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="VACANT">Vacant</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
