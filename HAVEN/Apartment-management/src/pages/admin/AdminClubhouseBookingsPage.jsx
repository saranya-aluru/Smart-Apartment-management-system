import React, { useState, useEffect } from "react";
import { BookmarkCheck, Calendar, Clock, Users, Check, X, Ban } from "lucide-react";
import {
  getAdminClubhouseBookings,
  updateClubhouseBookingStatus
} from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const AdminClubhouseBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminClubhouseBookings();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load clubhouse bookings:", err);
      setError("Failed to fetch clubhouse reservations from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, nextStatus) => {
    setError("");
    setSuccess("");
    try {
      await updateClubhouseBookingStatus(bookingId, nextStatus);
      setSuccess(`Booking #${bookingId} has been marked as ${nextStatus}.`);
      fetchBookings();
    } catch (err) {
      console.error("Failed to update booking status:", err);
      setError(err.response?.data?.message || "Failed to update booking status.");
    }
  };

  const columns = [
    {
      header: "Booking ID & Facility",
      key: "booking_id",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>
            #{row.booking_id} — {row.facility_name}
          </div>
          <div style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
            Purpose: {row.purpose || "Recreation"}
          </div>
        </div>
      )
    },
    {
      header: "Resident & Flat",
      key: "resident_name",
      render: (row) => (
        <div>
          <span style={{ fontWeight: 500, color: "var(--color-dark)" }}>
            {row.resident_name || `Resident #${row.resident_id}`}
          </span>
          {row.apartment_number && (
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
              Flat {row.apartment_number}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Slot Date & Timings",
      key: "booking_date",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.825rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Calendar size={13} color="var(--color-forest)" />
            <span>{formatDate(row.booking_date)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-muted)" }}>
            <Clock size={13} />
            <span>{row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}</span>
          </div>
        </div>
      )
    },
    {
      header: "Guests & Tariff (₹)",
      key: "guest_count",
      render: (row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.825rem" }}>
            <Users size={13} color="var(--color-muted)" />
            <span>{row.guest_count} guests</span>
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-forest)", marginTop: "2px" }}>
            {formatCurrency(row.booking_charge)}
          </div>
        </div>
      )
    },
    {
      header: "Status",
      key: "booking_status",
      render: (row) => <Badge status={row.booking_status} />
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {row.booking_status === "PENDING" && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleUpdateStatus(row.booking_id, "APPROVED")}
              >
                <Check size={13} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleUpdateStatus(row.booking_id, "REJECTED")}
              >
                <X size={13} />
                <span>Reject</span>
              </button>
            </>
          )}

          {row.booking_status === "APPROVED" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleUpdateStatus(row.booking_id, "CANCELLED")}
            >
              <Ban size={13} />
              <span>Cancel</span>
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
          <h2>Clubhouse Reservations</h2>
          <p className="card-subtitle">Review resident reservations, check facility schedules, and manage approvals in ₹ (INR)</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          searchPlaceholder="Search facility, resident, flat number, purpose..."
          searchFields={["facility_name", "resident_name", "purpose", "apartment_number"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "Cancelled", value: "CANCELLED" }
          ]}
          filterKey="booking_status"
          emptyTitle="No bookings found"
          emptyMessage="No facility reservations recorded in the system yet."
        />
      </div>
    </div>
  );
};
