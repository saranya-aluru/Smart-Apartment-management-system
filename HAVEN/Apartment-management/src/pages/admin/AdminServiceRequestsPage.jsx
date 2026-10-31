import React, { useState, useEffect } from "react";
import { ClipboardList, Calendar, Check, X, CheckCircle2 } from "lucide-react";
import { getAdminServiceRequests, updateServiceRequestStatus } from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { AlertBanner } from "../../components/common/AlertBanner";

export const AdminServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminServiceRequests();
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load service requests:", err);
      setError("Failed to fetch resident service requests from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId, nextStatus) => {
    setError("");
    setSuccess("");
    try {
      await updateServiceRequestStatus(requestId, nextStatus);
      setSuccess(`Service request #${requestId} status updated to ${nextStatus}.`);
      fetchRequests();
    } catch (err) {
      console.error("Failed to update service request status:", err);
      setError(err.response?.data?.message || "Failed to update request status.");
    }
  };

  const columns = [
    {
      header: "Req ID",
      key: "request_id",
      render: (row) => <strong>#{row.request_id}</strong>
    },
    {
      header: "Service",
      key: "service_name",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--color-dark)" }}>
          {row.service_name}
        </span>
      )
    },
    {
      header: "Resident",
      key: "resident_name",
      render: (row) => (
        <span>{row.resident_name || `Resident #${row.resident_id}`}</span>
      )
    },
    {
      header: "Requested Date",
      key: "booking_date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.825rem" }}>
          <Calendar size={13} color="var(--color-muted)" />
          <span>{row.booking_date}</span>
        </div>
      )
    },
    {
      header: "Notes",
      key: "description",
      render: (row) => (
        <p style={{ maxWidth: "240px", fontSize: "0.825rem", color: "var(--color-dark)" }}>
          {row.description || "—"}
        </p>
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
          {row.status === "PENDING" && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleUpdateStatus(row.request_id, "APPROVED")}
              >
                <Check size={13} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleUpdateStatus(row.request_id, "CANCELLED")}
              >
                <X size={13} />
                <span>Cancel</span>
              </button>
            </>
          )}

          {row.status === "APPROVED" && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleUpdateStatus(row.request_id, "COMPLETED")}
            >
              <CheckCircle2 size={13} />
              <span>Mark Done</span>
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
          <h2>Service Requests</h2>
          <p className="card-subtitle">Manage resident on-demand service bookings, approvals, and completions</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          searchPlaceholder="Search service, resident, notes..."
          searchFields={["service_name", "resident_name", "description"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" }
          ]}
          filterKey="status"
          emptyTitle="No service requests found"
          emptyMessage="No residents have submitted service requests yet."
        />
      </div>
    </div>
  );
};
