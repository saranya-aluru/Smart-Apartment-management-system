import React from "react";

export const Badge = ({ status, variant }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  // If a specific variant is passed, use it; otherwise infer from status
  let badgeClass = "badge-muted";

  if (variant) {
    badgeClass = `badge-${variant}`;
  } else if (
    ["ACTIVE", "VACANT", "COMPLETED", "APPROVED", "AVAILABLE", "PUBLISHED", "REGISTERED"].includes(normalized)
  ) {
    badgeClass = "badge-success";
  } else if (
    ["PENDING", "IN_PROGRESS", "UPCOMING", "LOW", "MEDIUM"].includes(normalized)
  ) {
    badgeClass = "badge-warning";
  } else if (
    ["OCCUPIED", "HIGH", "URGENT", "REJECTED", "CANCELLED", "INACTIVE", "EMERGENCY"].includes(normalized)
  ) {
    badgeClass = "badge-danger";
  } else if (
    ["MAINTENANCE", "UNAVAILABLE", "DRAFT", "ARCHIVED", "SECURITY", "PAYMENT"].includes(normalized)
  ) {
    badgeClass = "badge-info";
  }

  // Format label for display (e.g. IN_PROGRESS -> In Progress)
  const formatLabel = (str) => {
    return str
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <span className={`badge ${badgeClass}`}>
      {formatLabel(normalized)}
    </span>
  );
};
