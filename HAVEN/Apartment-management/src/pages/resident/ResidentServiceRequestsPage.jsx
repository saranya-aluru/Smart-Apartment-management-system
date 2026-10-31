import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Calendar, Sparkles, Plus } from "lucide-react";
import { getResidentServiceRequests } from "../../api/resident";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const ResidentServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getResidentServiceRequests();
      setRequests(data || []);
    } catch (err) {
      console.error("Failed to load resident service requests:", err);
      setError("Failed to fetch your service requests from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const columns = [
    {
      header: "Booking ID & Service",
      key: "request_id",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>
            #{row.request_id} — {row.service_name}
          </div>
          <div style={{ fontSize: "0.775rem", color: "var(--color-forest)", fontWeight: 600 }}>
            {formatCurrency(row.service_charge)}
          </div>
        </div>
      )
    },
    {
      header: "Service Date",
      key: "booking_date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
          <Calendar size={13} color="var(--color-forest)" />
          <span>{formatDate(row.booking_date)}</span>
        </div>
      )
    },
    {
      header: "Instructions for Technician",
      key: "description",
      render: (row) => (
        <p style={{ maxWidth: "300px", fontSize: "0.825rem", color: "var(--color-dark)" }}>
          {row.description || "—"}
        </p>
      )
    },
    {
      header: "Booked On",
      key: "created_at",
      render: (row) => (
        <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
          {formatDate(row.created_at)}
        </span>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => <Badge status={row.status} />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>My Service Bookings</h2>
          <p className="card-subtitle">Track fulfillment and technician visits for requested household services</p>
        </div>

        <Link to="/resident/services" className="btn btn-primary">
          <Plus size={16} />
          <span>Book New Service</span>
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={requests}
          loading={loading}
          searchPlaceholder="Search service name or instructions..."
          searchFields={["service_name", "description"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" }
          ]}
          filterKey="status"
          emptyTitle="No service requests found"
          emptyMessage="You have not requested any community services yet."
        />
      </div>
    </div>
  );
};
