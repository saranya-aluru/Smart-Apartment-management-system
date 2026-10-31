import React, { useState, useEffect } from "react";
import { CalendarDays, MapPin, Clock, CheckCircle2, UserCheck } from "lucide-react";
import { getPublicEvents } from "../../api/shared";
import { registerForEvent, getResidentEventRegistrations } from "../../api/resident";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { formatDate } from "../../utils/formatters";

export const ResidentEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registeringId, setRegisteringId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsData, regData] = await Promise.all([
        getPublicEvents(),
        getResidentEventRegistrations().catch(() => [])
      ]);

      setEvents(eventsData || []);
      const registeredIds = new Set((regData || []).map((r) => r.event_id));
      setRegisteredEventIds(registeredIds);
    } catch (err) {
      console.error("Failed to load community events:", err);
      setError("Failed to fetch community events from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (eventId, title) => {
    setRegisteringId(eventId);
    setError("");
    setSuccess("");
    try {
      await registerForEvent(eventId);
      setSuccess(`You have successfully registered for "${title}".`);
      fetchData();
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Failed to register for this event.");
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner message="Loading upcoming society events..." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="card-header">
        <div>
          <h2>Society Celebrations & Gatherings</h2>
          <p className="card-subtitle">Connect with neighbors at upcoming festival celebrations, sports tournaments, and society meetings</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      {events.length === 0 ? (
        <div className="card empty-state">
          <CalendarDays size={44} className="empty-state-icon" />
          <h3 className="empty-state-title">No Upcoming Events</h3>
          <p>There are no community events scheduled right now. Check back soon!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem"
          }}
        >
          {events.map((ev) => {
            const isRegistered = registeredEventIds.has(ev.event_id);
            return (
              <div
                key={ev.event_id}
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
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>{ev.title}</h3>
                    {isRegistered ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Attending
                      </span>
                    ) : (
                      <Badge status={ev.status} />
                    )}
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--color-dark)", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {ev.description || "Join fellow society residents for this community gathering."}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.825rem", color: "var(--color-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <CalendarDays size={14} color="var(--color-forest)" />
                      <strong style={{ color: "var(--color-dark)" }}>{formatDate(ev.event_date)}</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Clock size={14} />
                      <span>{ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <MapPin size={14} />
                      <span>{ev.venue || "Society Clubhouse / Lawn"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--color-border-subtle)" }}>
                  <button
                    type="button"
                    className={`btn ${isRegistered ? "btn-secondary" : "btn-primary"}`}
                    style={{ width: "100%" }}
                    onClick={() => handleRegister(ev.event_id, ev.title)}
                    disabled={registeringId === ev.event_id || isRegistered}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Registered (Attending)</span>
                      </>
                    ) : registeringId === ev.event_id ? (
                      <span>Registering...</span>
                    ) : (
                      <>
                        <UserCheck size={15} />
                        <span>Register to Attend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
