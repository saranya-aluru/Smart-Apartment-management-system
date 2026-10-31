import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookmarkCheck, Calendar, Clock, Users, Ban, Plus } from "lucide-react";
import { getResidentClubhouseBookings, cancelResidentClubhouseBooking } from "../../api/resident";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatCurrency } from "../../utils/formatters";

export const ResidentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getResidentClubhouseBookings();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load resident bookings:", err);
      setError("Failed to fetch your clubhouse bookings from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this clubhouse reservation?")) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      await cancelResidentClubhouseBooking(bookingId);
      setSuccess(`Booking #${bookingId} has been cancelled.`);
      fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError(err.response?.data?.message || "Failed to cancel booking reservation.");
    }
  };

  const columns = [
    {
      header: "Booking & Facility",
      key: "booking_id",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>
            #{row.booking_id} — {row.facility_name}
          </div>
          <div style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
            {row.location}
          </div>
        </div>
      )
    },
    {
      header: "Reservation Slot",
      key: "booking_date",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.825rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Calendar size={13} color="var(--color-forest)" />
            <strong>{row.booking_date}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-muted)" }}>
            <Clock size={13} />
            <span>{row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}</span>
          </div>
        </div>
      )
    },
    {
      header: "Purpose & Guests",
      key: "purpose",
      render: (row) => (
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>{row.purpose}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{row.guest_count} guests</div>
        </div>
      )
    },
    {
      header: "Charge",
      key: "booking_charge",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--color-forest)" }}>
          {formatCurrency(row.booking_charge)}
        </span>
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
      render: (row) => {
        const canCancel = ["PENDING", "APPROVED"].includes(row.booking_status);
        if (!canCancel) return <span style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>—</span>;
        return (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleCancelBooking(row.booking_id)}
          >
            <Ban size={13} />
            <span>Cancel</span>
          </button>
        );
      }
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>My Clubhouse Bookings</h2>
          <p className="card-subtitle">View and manage your facility reservations and schedules</p>
        </div>

        <Link to="/resident/clubhouse" className="btn btn-primary">
          <Plus size={16} />
          <span>New Reservation</span>
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          searchPlaceholder="Search facility, purpose..."
          searchFields={["facility_name", "purpose", "location"]}
          filterOptions={[
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Cancelled", value: "CANCELLED" },
            { label: "Rejected", value: "REJECTED" }
          ]}
          filterKey="booking_status"
          emptyTitle="No bookings found"
          emptyMessage="You have not reserved any clubhouse facilities yet."
        />
      </div>
    </div>
  );
};
