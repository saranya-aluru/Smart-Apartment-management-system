import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { getPublicServices } from "../../api/shared";
import { createResidentServiceRequest } from "../../api/resident";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatCurrency } from "../../utils/formatters";

export const ResidentServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPublicServices();
      setServices(data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError("Failed to load community services from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenBooking = (svc) => {
    setSelectedService(svc);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split("T")[0]);
    setDescription("");
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedService || !bookingDate) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createResidentServiceRequest({
        serviceId: selectedService.service_id,
        bookingDate,
        description: description.trim()
      });
      setSuccess(`Request for "${selectedService.service_name}" submitted successfully.`);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to book service:", err);
      setError(err.response?.data?.message || "Failed to submit service request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && services.length === 0) {
    return <LoadingSpinner message="Loading community service catalog..." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society On-Demand Services</h2>
          <p className="card-subtitle">Verified technicians for doorstep household repairs, servicing, and cleaning in ₹ (INR)</p>
        </div>

        <Link to="/resident/service-requests" className="btn btn-secondary">
          <span>View My Service Bookings</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Services Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {services.map((svc) => {
          const isAvailable = svc.availability_status === "AVAILABLE";
          return (
            <div
              key={svc.service_id}
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
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-cream)",
                        color: "var(--color-forest)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Sparkles size={18} />
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{svc.service_name}</h3>
                  </div>
                  <Badge status={svc.availability_status} />
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", lineHeight: 1.5, minHeight: "40px" }}>
                  {svc.description || "Reliable, professional service provided by verified society partners."}
                </p>
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
                  <span style={{ fontSize: "0.7rem", color: "var(--color-muted)", textTransform: "uppercase" }}>CHARGE</span>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-forest)" }}>
                    {formatCurrency(svc.service_charge)}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenBooking(svc)}
                  disabled={!isAvailable}
                >
                  Book Service
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Book ${selectedService?.service_name}`}
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
              form="book-service-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Booking..." : "Confirm Request"}
            </button>
          </>
        }
      >
        <form id="book-service-form" onSubmit={handleSubmitRequest}>
          <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "var(--color-cream-soft)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>
              <strong>Standard Charge:</strong> {formatCurrency(selectedService?.service_charge)}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "2px" }}>
              {selectedService?.description}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label required">Preferred Booking Date</label>
            <input
              type="date"
              className="form-input"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Special Instructions for Technician</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Please arrive after 4:00 PM; check RO water filter sediment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
