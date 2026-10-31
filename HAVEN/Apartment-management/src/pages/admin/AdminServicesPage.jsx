import React, { useState, useEffect } from "react";
import { Plus, Sparkles } from "lucide-react";
import { getAdminServices, createService, updateServiceAvailability } from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatCurrency } from "../../utils/formatters";

export const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    serviceName: "",
    description: "",
    serviceCharge: 350
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminServices();
      setServices(data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError("Failed to fetch community services from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      serviceName: "",
      description: "",
      serviceCharge: 350
    });
    setIsAddModalOpen(true);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createService({
        serviceName: form.serviceName.trim(),
        description: form.description.trim(),
        serviceCharge: Number(form.serviceCharge)
      });
      setSuccess(`Service "${form.serviceName}" created successfully.`);
      setIsAddModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error("Failed to create service:", err);
      setError(err.response?.data?.message || "Failed to create community service.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (svc) => {
    const nextStatus = svc.availability_status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    try {
      await updateServiceAvailability(svc.service_id, nextStatus);
      setSuccess(`Service "${svc.service_name}" marked as ${nextStatus}.`);
      fetchServices();
    } catch (err) {
      console.error("Failed to update availability:", err);
      setError(err.response?.data?.message || "Failed to update availability.");
    }
  };

  const columns = [
    {
      header: "Service Name",
      key: "service_name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={16} color="var(--color-forest)" />
          <strong>{row.service_name}</strong>
        </div>
      )
    },
    {
      header: "Description",
      key: "description",
      render: (row) => (
        <p style={{ maxWidth: "320px", fontSize: "0.85rem", color: "var(--color-dark)" }}>
          {row.description || "—"}
        </p>
      )
    },
    {
      header: "Standard Charge (₹)",
      key: "service_charge",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--color-forest)" }}>
          {formatCurrency(row.service_charge)}
        </span>
      )
    },
    {
      header: "Availability",
      key: "availability_status",
      render: (row) => <Badge status={row.availability_status} />
    },
    {
      header: "Action",
      key: "actions",
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleToggleAvailability(row)}
        >
          {row.availability_status === "AVAILABLE" ? "Set Unavailable" : "Set Available"}
        </button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society Community Services</h2>
          <p className="card-subtitle">Manage on-demand household services, technician charges in ₹ (INR), and catalog availability</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={services}
          loading={loading}
          searchPlaceholder="Search service name or description..."
          searchFields={["service_name", "description"]}
          filterOptions={[
            { label: "Available", value: "AVAILABLE" },
            { label: "Unavailable", value: "UNAVAILABLE" }
          ]}
          filterKey="availability_status"
          emptyTitle="No community services found"
          emptyMessage="No community services are currently registered."
        />
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Community Service"
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
              form="add-service-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Publish Service"}
            </button>
          </>
        }
      >
        <form id="add-service-form" onSubmit={handleCreateService}>
          <div className="form-group">
            <label className="form-label required">Service Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. RO Purifier Servicing, AC Maintenance, Deep Cleaning"
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Standard Service Charge (₹)</label>
            <input
              type="number"
              min="0"
              step="1"
              className="form-input"
              value={form.serviceCharge}
              onChange={(e) => setForm({ ...form, serviceCharge: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Scope of Work</label>
            <textarea
              className="form-textarea"
              placeholder="Detail technician scope, materials, and resident instructions..."
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
