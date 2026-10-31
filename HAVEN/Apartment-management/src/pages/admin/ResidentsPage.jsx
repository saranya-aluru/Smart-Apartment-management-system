import React, { useState, useEffect } from "react";
import { Users, Phone, Mail, Home, Calendar } from "lucide-react";
import { getAdminResidents } from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatDate } from "../../utils/formatters";

export const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResidents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminResidents();
      setResidents(data || []);
    } catch (err) {
      console.error("Failed to load residents:", err);
      setError("Failed to fetch resident records from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const columns = [
    {
      header: "Resident Name",
      key: "full_name",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>
            {row.full_name}
          </div>
          <div style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
            @{row.username}
          </div>
        </div>
      )
    },
    {
      header: "Allocated Flat",
      key: "apartment_number",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Home size={15} color="var(--color-forest)" />
          <span>
            Flat <strong>{row.apartment_number}</strong> ({row.building})
          </span>
        </div>
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
      header: "Move-in Date",
      key: "move_in_date",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.825rem" }}>
          <Calendar size={13} color="var(--color-muted)" />
          <span>{formatDate(row.move_in_date)}</span>
        </div>
      )
    },
    {
      header: "Status",
      key: "resident_status",
      render: (row) => <Badge status={row.resident_status} />
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society Resident Directory</h2>
          <p className="card-subtitle">Comprehensive registry of all flat owners and tenant residents</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={residents}
          loading={loading}
          searchPlaceholder="Search by name, flat number, tower, mobile..."
          searchFields={["full_name", "username", "email", "apartment_number", "building", "phone"]}
          filterOptions={[
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" }
          ]}
          filterKey="resident_status"
          emptyTitle="No residents found"
          emptyMessage="No residents are currently registered in the society database."
        />
      </div>
    </div>
  );
};
