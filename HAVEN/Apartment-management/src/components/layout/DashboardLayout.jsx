import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "./DashboardLayout.css";

export const DashboardLayout = ({ title = "Dashboard", children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="haven-app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="haven-main-wrapper">
        <Navbar
          title={title}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="haven-page-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
