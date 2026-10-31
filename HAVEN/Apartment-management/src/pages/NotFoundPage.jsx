import React from "react";
import { Link } from "react-router-dom";
import { Building2, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const NotFoundPage = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  const homePath = isAuthenticated ? getDashboardPath(role) : "/login";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-cream)",
        padding: "2rem"
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "480px",
          textAlign: "center",
          padding: "3rem 2rem",
          borderRadius: "var(--radius-lg)"
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--color-cream)",
            color: "var(--color-forest)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem"
          }}
        >
          <Building2 size={36} />
        </div>

        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--color-dark)" }}>404</h1>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--color-dark)", marginTop: "0.25rem" }}>
          Page Not Found
        </h2>
        <p style={{ color: "var(--color-muted)", margin: "0.75rem auto 1.75rem", maxWidth: "340px", fontSize: "0.9rem" }}>
          The residential page or dashboard path you requested does not exist or has moved.
        </p>

        <Link to={homePath} className="btn btn-primary" style={{ display: "inline-flex" }}>
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
