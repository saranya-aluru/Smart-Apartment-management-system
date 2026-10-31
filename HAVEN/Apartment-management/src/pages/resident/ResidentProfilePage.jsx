import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Home, Calendar, ShieldCheck, MapPin } from "lucide-react";
import { getResidentProfile } from "../../api/resident";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";
import { Badge } from "../../components/common/Badge";
import { formatDate } from "../../utils/formatters";

export const ResidentProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getResidentProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load resident profile:", err);
        setError("Failed to fetch resident profile from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  if (error) {
    return <AlertBanner type="error" message={error} onClose={() => setError("")} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      <div className="card-header">
        <div>
          <h2>Resident Profile</h2>
          <p className="card-subtitle">Personal resident records and allocated society flat details</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="card" style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "var(--color-forest)",
            color: "var(--color-white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "R"}
        </div>

        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>{profile?.full_name}</h3>
            <Badge status={profile?.resident_status} />
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "2px" }}>
            @{profile?.username} • Resident Member ID: #{profile?.resident_id}
          </p>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {/* Contact Information */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: "1rem" }}>
            <h3 className="card-title">Contact Information</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Mail size={18} color="var(--color-forest)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>EMAIL ADDRESS</p>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>{profile?.email}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Phone size={18} color="var(--color-forest)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>MOBILE NUMBER</p>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>{profile?.phone || "Not specified"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar size={18} color="var(--color-forest)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>MOVE-IN DATE</p>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>
                  {formatDate(profile?.move_in_date)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Apartment */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: "1rem" }}>
            <h3 className="card-title">Flat Unit Allocation</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Home size={18} color="var(--color-forest)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>FLAT NUMBER & TOWER</p>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>
                  Flat {profile?.apartment_number} ({profile?.building})
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <MapPin size={18} color="var(--color-forest)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>FLOOR LEVEL</p>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>Floor {profile?.floor}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <ShieldCheck size={18} color="var(--color-forest)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>LAYOUT SPECIFICATIONS</p>
                <strong style={{ fontSize: "0.9rem", color: "var(--color-dark)" }}>
                  {profile?.bedrooms ? `${profile.bedrooms} BHK` : "—"} • {profile?.area_sqft ? `${profile.area_sqft} sq ft` : "—"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
