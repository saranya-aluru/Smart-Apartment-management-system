import React, { useState, useEffect } from "react";
import { Plus, UserCheck, Phone, Mail, ShieldAlert } from "lucide-react";
import { getAdminStaff, createStaff, updateStaffStatus } from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";

export const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    department: "Maintenance",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminStaff();
      setStaffList(data || []);
    } catch (err) {
      console.error("Failed to load staff:", err);
      setError("Failed to fetch staff members from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      fullName: "",
      department: "Maintenance",
      phone: ""
    });
    setIsAddModalOpen(true);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createStaff({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        department: form.department.trim(),
        phone: form.phone.trim()
      });
      setSuccess(`Staff technician ${form.fullName} successfully registered.`);
      setIsAddModalOpen(false);
      fetchStaff();
    } catch (err) {
      console.error("Failed to add staff:", err);
      setError(err.response?.data?.message || "Failed to create staff member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.staff_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStaffStatus(staff.staff_id, nextStatus);
      setSuccess(`Staff member ${staff.full_name} status updated to ${nextStatus}.`);
      fetchStaff();
    } catch (err) {
      console.error("Failed to update staff status:", err);
      setError(err.response?.data?.message || "Failed to change staff status.");
    }
  };

  const columns = [
    {
      header: "Staff Technician",
      key: "full_name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--color-cream)",
              color: "var(--color-forest)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "0.85rem"
            }}
          >
            {row.full_name ? row.full_name.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>{row.full_name}</div>
            <div style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>@{row.username}</div>
          </div>
        </div>
      )
    },
    {
      header: "Department",
      key: "department",
      render: (row) => (
        <span style={{ fontWeight: 500, color: "var(--color-dark)" }}>
          {row.department || "Society Operations"}
        </span>
      )
    },
    {
      header: "Contact Details",
      key: "email",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.825rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Mail size={13} color="var(--color-muted)" />
            <span>{row.email}</span>
          </div>
          {row.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Phone size={13} color="var(--color-muted)" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: "Status",
      key: "staff_status",
      render: (row) => <Badge status={row.staff_status} />
    },
    {
      header: "Action",
      key: "actions",
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleToggleStatus(row)}
          title={row.staff_status === "ACTIVE" ? "Deactivate staff" : "Activate staff"}
        >
          {row.staff_status === "ACTIVE" ? "Set Inactive" : "Set Active"}
        </button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society Staff Directory</h2>
          <p className="card-subtitle">Manage building electricians, plumbers, security supervisors, and maintenance technicians</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={staffList}
          loading={loading}
          searchPlaceholder="Search staff by name, department, phone, email..."
          searchFields={["full_name", "username", "department", "email", "phone"]}
          filterOptions={[
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" }
          ]}
          filterKey="staff_status"
          emptyTitle="No staff members found"
          emptyMessage="No staff members are registered yet. Click 'Add Staff Member' to register one."
        />
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Society Staff Technician"
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
              form="add-staff-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Register Staff"}
            </button>
          </>
        }
      >
        <form id="add-staff-form" onSubmit={handleCreateStaff}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Trade / Department</label>
              <select
                className="form-select"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              >
                <option value="Maintenance">General Maintenance</option>
                <option value="Plumbing">Plumbing & Water Supply</option>
                <option value="Electrical">Electrical & DG Backup</option>
                <option value="Housekeeping">Housekeeping & Cleaning</option>
                <option value="Security">Security & Gate Operations</option>
                <option value="Clubhouse">Clubhouse Facility Supervisor</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Staff Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Unique username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="staff@haven.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Temporary Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 00001"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
