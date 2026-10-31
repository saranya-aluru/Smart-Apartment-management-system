import React from "react";

export const StatCard = ({ title, value, icon: Icon, subtitle, badge }) => {
  return (
    <div className="card stat-card" style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
      {Icon && (
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-cream)",
            color: "var(--color-forest)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Icon size={24} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.825rem", fontWeight: 500, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {title}
          </p>
          {badge && <span className="badge badge-muted">{badge}</span>}
        </div>

        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-dark)", marginTop: "0.25rem", lineHeight: 1.2 }}>
          {value !== undefined && value !== null ? value : "—"}
        </div>

        {subtitle && (
          <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
