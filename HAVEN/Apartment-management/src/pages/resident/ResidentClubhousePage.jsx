import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, MapPin, Users, Clock, IndianRupee, BookmarkCheck, ArrowRight } from "lucide-react";
import { getPublicClubhouseFacilities } from "../../api/shared";
import { createResidentClubhouseBooking } from "../../api/resident";
import { formatCurrency } from "../../utils/formatters";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";

export const ResidentClubhousePage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [form, setForm] = useState({
    bookingDate: "",
    startTime: "10:00:00",
    endTime: "11:00:00",
    purpose: "",
    guestCount: 2
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPublicClubhouseFacilities();
      setFacilities(data || []);
    } catch (err) {
      console.error("Failed to load facilities:", err);
      setError("Failed to fetch clubhouse facilities from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenBooking = (facility) => {
    setSelectedFacility(facility);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    // Format default times within facility hours
    const openTime = facility.opening_time ? facility.opening_time.slice(0, 8) : "09:00:00";
    const [h, m, s] = openTime.split(":");
    const endH = String(Math.min(23, Number(h) + 1)).padStart(2, "0");

    setForm({
      bookingDate: tomorrow.toISOString().split("T")[0],
      startTime: openTime,
      endTime: `${endH}:${m}:${s}`,
      purpose: "Recreation & fitness",
      guestCount: Math.min(2, facility.capacity || 1)
    });
    setIsModalOpen(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    if (form.guestCount > selectedFacility.capacity) {
      setError(`Guest count cannot exceed maximum capacity (${selectedFacility.capacity} guests).`);
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("Booking end time must be after start time.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createResidentClubhouseBooking({
        clubhouseId: selectedFacility.clubhouse_id,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
        guestCount: Number(form.guestCount)
      });
      setSuccess(`Reservation request for "${selectedFacility.name}" submitted successfully.`);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to book clubhouse facility:", err);
      setError(err.response?.data?.message || "Failed to submit booking reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && facilities.length === 0) {
    return <LoadingSpinner message="Loading clubhouse facilities..." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Clubhouse Facilities</h2>
          <p className="card-subtitle">Reserve recreational amenities, sports facilities, and celebration halls</p>
        </div>

        <Link to="/resident/my-bookings" className="btn btn-secondary">
          <BookmarkCheck size={16} />
          <span>View My Bookings</span>
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {facilities.map((fac) => {
          const isAvailable = fac.status === "AVAILABLE";
          return (
            <div
              key={fac.clubhouse_id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-cream)",
                        color: "var(--color-forest)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Home size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>{fac.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--color-muted)" }}>
                        <MapPin size={12} />
                        <span>{fac.location || "Clubhouse Building"}</span>
                      </div>
                    </div>
                  </div>
                  <Badge status={fac.status} />
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--color-dark)", margin: "0.75rem 0", lineHeight: 1.5, minHeight: "38px" }}>
                  {fac.description || "State-of-the-art facility available for residential bookings and recreation."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Users size={14} color="var(--color-muted)" />
                    <span>Max {fac.capacity} guests</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Clock size={14} color="var(--color-muted)" />
                    <span>{fac.opening_time?.slice(0, 5)} - {fac.closing_time?.slice(0, 5)}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--color-border-subtle)"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-muted)", textTransform: "uppercase" }}>RATE</span>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-forest)" }}>
                    {formatCurrency(fac.hourly_charge)}
                    <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--color-muted)" }}>/hr</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenBooking(fac)}
                  disabled={!isAvailable}
                >
                  Reserve Facility
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Facility Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Book ${selectedFacility?.name}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="book-clubhouse-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Booking..." : "Confirm Reservation"}
            </button>
          </>
        }
      >
        <form id="book-clubhouse-form" onSubmit={handleSubmitBooking}>
          <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "var(--color-cream-soft)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>
              <strong>Hourly Tariff:</strong> {formatCurrency(selectedFacility?.hourly_charge)}/hr |{" "}
              <strong>Operating Hours:</strong> {selectedFacility?.opening_time?.slice(0, 5)} - {selectedFacility?.closing_time?.slice(0, 5)}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "2px" }}>
              Maximum allowable capacity: {selectedFacility?.capacity} guests.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label required">Booking Date</label>
            <input
              type="date"
              className="form-input"
              value={form.bookingDate}
              onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Start Time</label>
              <input
                type="time"
                step="1"
                className="form-input"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">End Time</label>
              <input
                type="time"
                step="1"
                className="form-input"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Guest Count</label>
              <input
                type="number"
                min="1"
                max={selectedFacility?.capacity || 100}
                className="form-input"
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Purpose / Event Type</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Birthday, Tennis match"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
