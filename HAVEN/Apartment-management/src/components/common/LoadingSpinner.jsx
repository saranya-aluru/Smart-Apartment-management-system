import React from "react";

export const LoadingSpinner = ({ message = "Loading data..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontSize: "0.9rem", color: "var(--color-muted)" }}>{message}</p>
    </div>
  );
};
