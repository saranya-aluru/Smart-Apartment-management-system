import React, { useState, useEffect } from "react";
import { Building, Home, MapPin, CheckCircle2 } from "lucide-react";
import { getResidentProfile } from "../../api/resident";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { AlertBanner } from "../../components/common/AlertBanner";

export const ResidentApartmentPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApartment = async () => {
      setLoading(true);
      try {
        const data = await getResidentProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load apartment info:", err);
        setError("Failed to fetch apartment data.");
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading flat specifications..." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      <div className="card-header">
        <div>
          <h2>My Flat Details</h2>
          <p className="card-subtitle">Flat specifications, floor layout overview, and residential society amenities</p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      {/* Main Apartment Spec Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-forest)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              RESIDENTIAL SOCIETY RESIDENCE
            </span>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "0.2rem" }}>
              Flat {profile?.apartment_number}
            </h3>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
              {profile?.building} • Floor {profile?.floor}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-success">OCCUPIED</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            padding: "1.25rem",
            backgroundColor: "var(--color-cream-soft)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-subtle)"
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase" }}>CONFIGURATION</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-dark)", marginTop: "2px" }}>
              {profile?.bedrooms ? `${profile.bedrooms} BHK` : "—"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase" }}>SUPER BUILT-UP AREA</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-dark)", marginTop: "2px" }}>
              {profile?.area_sqft ? `${profile.area_sqft} sq ft` : "—"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase" }}>FLOOR LEVEL</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-dark)", marginTop: "2px" }}>
              Level {profile?.floor ?? "—"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase" }}>REGISTERED RESIDENT</span>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-dark)", marginTop: "2px" }}>
              {profile?.full_name}
            </div>
          </div>
        </div>
      </div>

      {/* Building Features & Rules */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: "1rem" }}>
          Society Amenities & Resident Facilities
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-dark)" }}>
            <CheckCircle2 size={16} color="var(--color-forest)" />
            <span>24/7 DG generator power backup and 24-hour piped water supply.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-dark)" }}>
            <CheckCircle2 size={16} color="var(--color-forest)" />
            <span>Access to resident clubhouse amenities: Badminton court, party hall, and indoor games room.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-dark)" }}>
            <CheckCircle2 size={16} color="var(--color-forest)" />
            <span>Dedicated society maintenance team for electrical, plumbing, and housekeeping complaints.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-dark)" }}>
            <CheckCircle2 size={16} color="var(--color-forest)" />
            <span>Designated covered car parking space allocated as per RWA rules.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
