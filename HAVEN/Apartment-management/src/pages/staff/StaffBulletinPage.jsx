import React, { useState, useEffect } from "react";
import { Bell, CalendarDays, MapPin, Clock, AlertTriangle } from "lucide-react";
import { getPublicAnnouncements, getPublicEvents } from "../../api/shared";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { formatDate } from "../../utils/formatters";

export const StaffBulletinPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [notices, evs] = await Promise.all([
          getPublicAnnouncements().catch(() => []),
          getPublicEvents().catch(() => [])
        ]);
        setAnnouncements(notices || []);
        setEvents(evs || []);
      } catch (err) {
        console.error("Failed to load staff bulletin:", err);
        setError("Failed to load bulletin notices from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading bulletin..." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="card-header">
        <div>
          <h2>Staff Operations Bulletin</h2>
          <p className="card-subtitle">Building notices, maintenance outages, and upcoming events schedule</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem"
        }}
      >
        {/* Announcements Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Notices & Broadcasts</h3>
          </div>

          {announcements.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
              No active announcements.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {announcements.map((item) => (
                <div
                  key={item.announcement_id}
                  style={{
                    padding: "0.85rem",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>{item.title}</strong>
                    <span className="badge badge-info">{item.category}</span>
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "var(--color-dark)", lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>
                    Published: {formatDate(item.published_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events Schedule Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scheduled Building Events</h3>
          </div>

          {events.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
              No events scheduled.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {events.map((ev) => (
                <div
                  key={ev.event_id}
                  style={{
                    padding: "0.85rem",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>{ev.title}</strong>
                    <Badge status={ev.status} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--color-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <CalendarDays size={13} color="var(--color-forest)" />
                      <span>{ev.event_date} ({ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <MapPin size={13} />
                      <span>Venue: {ev.venue || "Clubhouse"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
