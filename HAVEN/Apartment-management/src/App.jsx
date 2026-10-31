import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { ApartmentsPage } from "./pages/admin/ApartmentsPage";
import { ResidentsPage } from "./pages/admin/ResidentsPage";
import { StaffPage } from "./pages/admin/StaffPage";
import { AdminMaintenancePage } from "./pages/admin/AdminMaintenancePage";
import { AdminServicesPage } from "./pages/admin/AdminServicesPage";
import { AdminServiceRequestsPage } from "./pages/admin/AdminServiceRequestsPage";
import { AdminEventsPage } from "./pages/admin/AdminEventsPage";
import { AdminAnnouncementsPage } from "./pages/admin/AdminAnnouncementsPage";
import { AdminClubhouseFacilitiesPage } from "./pages/admin/AdminClubhouseFacilitiesPage";
import { AdminClubhouseBookingsPage } from "./pages/admin/AdminClubhouseBookingsPage";

// Resident Pages
import { ResidentDashboardPage } from "./pages/resident/ResidentDashboardPage";
import { ResidentProfilePage } from "./pages/resident/ResidentProfilePage";
import { ResidentApartmentPage } from "./pages/resident/ResidentApartmentPage";
import { ResidentMaintenancePage } from "./pages/resident/ResidentMaintenancePage";
import { ResidentServicesPage } from "./pages/resident/ResidentServicesPage";
import { ResidentServiceRequestsPage } from "./pages/resident/ResidentServiceRequestsPage";
import { ResidentEventsPage } from "./pages/resident/ResidentEventsPage";
import { ResidentAnnouncementsPage } from "./pages/resident/ResidentAnnouncementsPage";
import { ResidentClubhousePage } from "./pages/resident/ResidentClubhousePage";
import { ResidentBookingsPage } from "./pages/resident/ResidentBookingsPage";

// Staff Pages
import { StaffDashboardPage } from "./pages/staff/StaffDashboardPage";
import { StaffMaintenancePage } from "./pages/staff/StaffMaintenancePage";
import { StaffBulletinPage } from "./pages/staff/StaffBulletinPage";

// Root Redirect Component
const RootRedirect = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();
  if (isAuthenticated && role) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ADMIN PORTAL */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Overview">
                  <AdminDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/apartments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Apartments">
                  <ApartmentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/residents"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Residents">
                  <ResidentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Staff Directory">
                  <StaffPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Maintenance Tickets">
                  <AdminMaintenancePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Community Services">
                  <AdminServicesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/service-requests"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Service Requests">
                  <AdminServiceRequestsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Community Events">
                  <AdminEventsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Announcements">
                  <AdminAnnouncementsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clubhouse-facilities"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Clubhouse Facilities">
                  <AdminClubhouseFacilitiesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clubhouse-bookings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout title="Clubhouse Bookings">
                  <AdminClubhouseBookingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* RESIDENT PORTAL */}
          <Route
            path="/resident"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="Resident Home">
                  <ResidentDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/profile"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="My Profile">
                  <ResidentProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/apartment"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="My Apartment">
                  <ResidentApartmentPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/maintenance"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="Maintenance Requests">
                  <ResidentMaintenancePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/services"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="Community Services">
                  <ResidentServicesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/service-requests"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="My Service Requests">
                  <ResidentServiceRequestsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/events"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="Community Events">
                  <ResidentEventsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/announcements"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="Announcements">
                  <ResidentAnnouncementsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/clubhouse"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="Clubhouse Amenities">
                  <ResidentClubhousePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["RESIDENT"]}>
                <DashboardLayout title="My Bookings">
                  <ResidentBookingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* STAFF PORTAL */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <DashboardLayout title="Staff Operations">
                  <StaffDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/maintenance"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <DashboardLayout title="Assigned Maintenance">
                  <StaffMaintenancePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bulletin"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <DashboardLayout title="Operations Bulletin">
                  <StaffBulletinPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
