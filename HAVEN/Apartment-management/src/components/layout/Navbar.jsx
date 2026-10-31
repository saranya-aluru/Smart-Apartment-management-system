import React from "react";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Navbar = ({ onToggleSidebar, title }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="haven-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-right">
        <div className="navbar-user-chip">
          <div className="user-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-meta">
            <span className="user-username">{user?.username}</span>
            <span className="user-role-badge">
              <ShieldCheck size={12} /> {role}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm navbar-logout-btn"
          onClick={handleLogout}
          title="Sign out of your session"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
