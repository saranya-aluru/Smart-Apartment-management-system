import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const AlertBanner = ({ type = "info", message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />
  };

  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      <span style={{ display: "flex", flexShrink: 0 }}>
        {iconMap[type] || iconMap.info}
      </span>
      <div style={{ flex: 1, fontSize: "0.875rem" }}>
        {typeof message === "string" ? message : JSON.stringify(message)}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "currentColor",
            opacity: 0.7,
            display: "flex",
            padding: "2px"
          }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
