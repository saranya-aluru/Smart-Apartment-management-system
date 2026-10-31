import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AlertBanner } from "../../components/common/AlertBanner";
import "./AuthPages.css";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get("expired") === "true";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.success) {
        navigate(result.redirectPath);
      }
    } catch (err) {
      console.error("Login failed:", err);
      const serverMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        (err.response?.status === 401 ? "Invalid username or password." : "Login failed. Check server connection.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 size={32} color="#FFFFFF" />
          </div>
          <h1 className="auth-title">HAVEN</h1>
          <p className="auth-subtitle">Smart Apartment Management System</p>
        </div>

        {isExpired && (
          <AlertBanner
            type="warning"
            message="Your session has expired. Please sign in again."
            onClose={() => {}}
          />
        )}

        {error && (
          <AlertBanner
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label required" htmlFor="login-username">
              Username
            </label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                id="login-username"
                type="text"
                className="form-input with-icon"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="login-password">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input with-icon with-action"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="quick-creds-box">
          <p className="quick-creds-title">
            <ShieldCheck size={14} /> Quick Demo Accounts
          </p>
          <div className="quick-creds-buttons">
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill("admin", "Admin@123")}
            >
              <strong>Admin:</strong> admin
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill("testresident01", "Password@123")}
            >
              <strong>Resident:</strong> testresident01
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill("staff_john", "Password@123")}
            >
              <strong>Staff:</strong> staff_john
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            New resident?{" "}
            <Link to="/register" className="auth-link">
              Register apartment
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
