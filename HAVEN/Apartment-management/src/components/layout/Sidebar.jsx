import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Building,
  Users,
  UserCheck,
  Wrench,
  Sparkles,
  ClipboardList,
  CalendarDays,
  Bell,
  Home,
  BookmarkCheck,
  User,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminNav = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Apartments", path: "/admin/apartments", icon: Building },
    { name: "Residents", path: "/admin/residents", icon: Users },
    { name: "Staff", path: "/admin/staff", icon: UserCheck },
    { name: "Maintenance", path: "/admin/maintenance", icon: Wrench },
    { name: "Community Services", path: "/admin/services", icon: Sparkles },
    { name: "Service Requests", path: "/admin/service-requests", icon: ClipboardList },
    { name: "Events", path: "/admin/events", icon: CalendarDays },
    { name: "Announcements", path: "/admin/announcements", icon: Bell },
    { name: "Clubhouse Facilities", path: "/admin/clubhouse-facilities", icon: Home },
    { name: "Clubhouse Bookings", path: "/admin/clubhouse-bookings", icon: BookmarkCheck }
  ];

  const residentNav = [
    { name: "Dashboard", path: "/resident", icon: LayoutDashboard },
    { name: "My Profile", path: "/resident/profile", icon: User },
    { name: "My Apartment", path: "/resident/apartment", icon: Building },
    { name: "Maintenance Requests", path: "/resident/maintenance", icon: Wrench },
    { name: "Community Services", path: "/resident/services", icon: Sparkles },
    { name: "My Service Requests", path: "/resident/service-requests", icon: ClipboardList },
    { name: "Community Events", path: "/resident/events", icon: CalendarDays },
    { name: "Announcements", path: "/resident/announcements", icon: Bell },
    { name: "Clubhouse", path: "/resident/clubhouse", icon: Home },
    { name: "My Bookings", path: "/resident/my-bookings", icon: BookmarkCheck }
  ];

  const staffNav = [
    { name: "Dashboard", path: "/staff", icon: LayoutDashboard },
    { name: "Maintenance Requests", path: "/staff/maintenance", icon: Wrench },
    { name: "Community Bulletin", path: "/staff/bulletin", icon: Bell }
  ];

  let navItems = residentNav;
  if (role === "ADMIN") navItems = adminNav;
  if (role === "STAFF") navItems = staffNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(37, 41, 35, 0.4)",
            zIndex: 40,
            display: "none"
          }}
          className="mobile-backdrop"
        />
      )}

      <aside className={`haven-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Building2 size={24} color="#FFFFFF" />
          </div>
          <div className="brand-info">
            <span className="brand-name">HAVEN</span>
            <span className="brand-badge">{role} PORTAL</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-title">NAVIGATION</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin" || item.path === "/resident" || item.path === "/staff"}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => onClose && onClose()}
              >
                <Icon size={18} className="link-icon" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="sidebar-footer">
          <div className="user-brief">
            <div className="user-avatar-small">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-details-small">
              <span className="user-name">{user?.username}</span>
              <span className="user-role-label">{user?.role}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
