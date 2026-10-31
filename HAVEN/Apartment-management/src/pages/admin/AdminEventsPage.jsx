import React, { useState, useEffect } from "react";
import { Plus, CalendarDays, MapPin, Clock, Users, X, Eye } from "lucide-react";
import {
  getAdminEvents,
  createEvent,
  updateEventStatus,
  getEventRegistrations
} from "../../api/admin";
import { DataTable } from "../../components/common/DataTable";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { AlertBanner } from "../../components/common/AlertBanner";
import { formatDate } from "../../utils/formatters";

export const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "18:00:00",
    endTime: "21:00:00",
    venue: "Society Central Lawn",
    posterUrl: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError("Failed to fetch community events from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const dateStr = tomorrow.toISOString().split("T")[0];

    setForm({
      title: "",
      description: "",
      eventDate: dateStr,
      startTime: "18:00:00",
      endTime: "21:00:00",
      venue: "Society Central Lawn & Amphitheatre",
      posterUrl: ""
    });
    setIsAddModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue.trim(),
        posterUrl: form.posterUrl.trim()
      });
      setSuccess(`Event "${form.title}" created successfully.`);
      setIsAddModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
      setError(err.response?.data?.message || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (eventId, nextStatus) => {
    try {
      await updateEventStatus(eventId, nextStatus);
      setSuccess(`Event status updated to ${nextStatus}.`);
      fetchEvents();
    } catch (err) {
      console.error("Failed to update event status:", err);
      setError(err.response?.data?.message || "Failed to update event status.");
    }
  };

  const handleViewRegistrations = async (ev) => {
    setSelectedEvent(ev);
    setIsRegistrationsModalOpen(true);
    setLoadingRegistrations(true);
    try {
      const data = await getEventRegistrations(ev.event_id);
      setRegistrations(data || []);
    } catch (err) {
      console.error("Failed to load event registrations:", err);
      setError("Failed to load attendees for this event.");
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const columns = [
    {
      header: "Event Title",
      key: "title",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--color-dark)" }}>{row.title}</div>
          <div style={{ fontSize: "0.775rem", color: "var(--color-muted)" }}>
            Organized by RWA Management
          </div>
        </div>
      )
    },
    {
      header: "Date & Time",
      key: "event_date",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.825rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CalendarDays size={13} color="var(--color-forest)" />
            <strong>{formatDate(row.event_date)}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-muted)" }}>
            <Clock size={13} />
            <span>{row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}</span>
          </div>
        </div>
      )
    },
    {
      header: "Venue in Society",
      key: "venue",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
          <MapPin size={14} color="var(--color-muted)" />
          <span>{row.venue || "Society Clubhouse"}</span>
        </div>
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
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleViewRegistrations(row)}
            title="View registered attendees"
          >
            <Users size={13} />
            <span>RSVP Attendees</span>
          </button>

          {row.status === "UPCOMING" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange(row.event_id, "CANCELLED")}
              title="Cancel event"
            >
              Cancel
            </button>
          )}

          {row.status === "UPCOMING" && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange(row.event_id, "COMPLETED")}
              title="Mark as completed"
            >
              Complete
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
          <h2>Society Community Events</h2>
          <p className="card-subtitle">Organize festival celebrations, society AGM meetings, fitness sessions, and monitor resident RSVPs</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Create New Event</span>
        </button>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        <DataTable
          columns={columns}
          data={events}
          loading={loading}
          searchPlaceholder="Search event title, venue, or description..."
          searchFields={["title", "venue", "description"]}
          filterOptions={[
            { label: "Upcoming", value: "UPCOMING" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" }
          ]}
          filterKey="status"
          emptyTitle="No events found"
          emptyMessage="No community events scheduled. Click 'Create New Event' to post one."
        />
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Society Community Event"
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
              form="add-event-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish Event"}
            </button>
          </>
        }
      >
        <form id="add-event-form" onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label required">Event Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Diwali Cultural Evening, Annual Society AGM, Yoga Morning"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Event Date</label>
            <input
              type="date"
              className="form-input"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
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

          <div className="form-group">
            <label className="form-label required">Venue in Society</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Society Central Lawn, Banquet Hall, Rooftop Garden"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Resident Guidelines</label>
            <textarea
              className="form-textarea"
              placeholder="Event schedule, dress code, refreshments provided, and family instructions..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* Registrations Modal */}
      <Modal
        isOpen={isRegistrationsModalOpen}
        onClose={() => setIsRegistrationsModalOpen(false)}
        title={`Registered Attendees — ${selectedEvent?.title}`}
        maxWidth="640px"
        footer={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsRegistrationsModalOpen(false)}
          >
            Close
          </button>
        }
      >
        {loadingRegistrations ? (
          <p style={{ textAlign: "center", padding: "1rem" }}>Loading attendees list...</p>
        ) : registrations.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-muted)", padding: "2rem" }}>
            No residents have registered for this event yet.
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Flat Unit</th>
                  <th>Contact Info</th>
                  <th>RSVP Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <tr key={reg.registration_id || idx}>
                    <td>
                      <strong>{reg.full_name}</strong>
                    </td>
                    <td>Flat {reg.apartment_number}</td>
                    <td>
                      <div style={{ fontSize: "0.8rem" }}>{reg.email}</div>
                      {reg.phone && <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{reg.phone}</div>}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>
                      {formatDate(reg.registration_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};
