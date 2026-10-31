import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, User, Mail, Phone, Home, ArrowRight } from "lucide-react";
import { getAvailableApartments } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { AlertBanner } from "../../components/common/AlertBanner";
import "./AuthPages.css";

export const RegisterPage = () => {
  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    apartmentId: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVacantApartments = async () => {
      setLoadingApartments(true);
      try {
        const data = await getAvailableApartments();
        setApartments(data || []);
      } catch (err) {
        console.error("Failed to load available apartments:", err);
        setError("Unable to load vacant flats from the server. Make sure the backend is running.");
      } finally {
        setLoadingApartments(false);
      }
    };

    fetchVacantApartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!form.apartmentId) {
      setError("Please select your flat / apartment unit.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        apartmentId: Number(form.apartmentId)
      };

      const result = await register(payload);
      if (result.success) {
        navigate(result.redirectPath);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const serverMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        (err.response?.status === 409
          ? "Username or email is already registered."
          : "Registration failed. Please check the details.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 size={32} color="#FFFFFF" />
          </div>
          <h1 className="auth-title">Resident Registration</h1>
          <p className="auth-subtitle">Join the HAVEN Gated Residential Community</p>
        </div>

        {error && (
          <AlertBanner
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="reg-fullname">
                Full Name
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="reg-fullname"
                  type="text"
                  name="fullName"
                  className="form-input with-icon"
                  placeholder="e.g. Rahul Sharma"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="reg-username">
                Username
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  className="form-input with-icon"
                  placeholder="Choose username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="reg-email">
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="form-input with-icon"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Mobile Number
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="form-input with-icon"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="reg-apartment">
              Select Vacant Flat / Unit
            </label>
            <div className="input-with-icon">
              <Home size={16} className="input-icon" />
              <select
                id="reg-apartment"
                name="apartmentId"
                className="form-select with-icon"
                value={form.apartmentId}
                onChange={handleChange}
                required
                disabled={loadingApartments}
              >
                <option value="">
                  {loadingApartments
                    ? "Loading vacant flats from society records..."
                    : apartments.length === 0
                    ? "No vacant flats currently available"
                    : "-- Choose a vacant flat --"}
                </option>
                {apartments.map((apt) => (
                  <option key={apt.apartmentId} value={apt.apartmentId}>
                    Flat {apt.apartmentNumber} — {apt.building}, Floor {apt.floor} ({apt.bedrooms} BHK, {apt.areaSqft} sq ft)
                  </option>
                ))}
              </select>
            </div>
            <span className="form-hint">
              Only verified vacant flats in the society are available for resident allocation.
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required" htmlFor="reg-password">
                Password
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input with-icon with-action"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label className="form-label required" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-input with-icon"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading || loadingApartments}
          >
            {loading ? (
              <span>Registering resident...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered?{" "}
            <Link to="/login" className="auth-link">
              Sign in to Society Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
