import React from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No records found",
  message = "There is currently no data to display for this section.",
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p style={{ maxWidth: "420px", margin: "0 auto 1.25rem", fontSize: "0.875rem" }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
