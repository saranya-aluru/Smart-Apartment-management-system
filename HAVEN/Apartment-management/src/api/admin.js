import api from "./axios";

// Dashboard
export const getAdminDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

// Apartments
export const getApartments = async (status) => {
  const url = status ? `/apartments?status=${encodeURIComponent(status)}` : "/apartments";
  const res = await api.get(url);
  return res.data;
};

export const createApartment = async (data) => {
  const res = await api.post("/admin/apartments", data);
  return res.data;
};

export const updateApartment = async (id, data) => {
  const res = await api.put(`/admin/apartments/${id}`, data);
  return res.data;
};

export const updateApartmentStatus = async (id, status) => {
  const res = await api.put(`/admin/apartments/${id}/status`, { status });
  return res.data;
};

// Residents
export const getAdminResidents = async () => {
  const res = await api.get("/admin/residents");
  return res.data;
};

// Staff
export const getAdminStaff = async () => {
  const res = await api.get("/admin/staff");
  return res.data;
};

export const createStaff = async (data) => {
  const res = await api.post("/admin/staff", data);
  return res.data;
};

export const updateStaffStatus = async (id, status) => {
  const res = await api.put(`/admin/staff/${id}/status`, { status });
  return res.data;
};

// Maintenance
export const getAdminMaintenance = async () => {
  const res = await api.get("/admin/maintenance");
  return res.data;
};

export const assignMaintenance = async (id, staffId) => {
  const res = await api.put(`/admin/maintenance/${id}/assign`, { staffId: Number(staffId) });
  return res.data;
};

// Community Services
export const getAdminServices = async () => {
  const res = await api.get("/services");
  return res.data;
};

export const createService = async (data) => {
  const res = await api.post("/admin/services", data);
  return res.data;
};

export const updateServiceAvailability = async (id, availabilityStatus) => {
  const res = await api.put(`/admin/services/${id}/availability`, { availabilityStatus });
  return res.data;
};

// Service Requests
export const getAdminServiceRequests = async () => {
  const res = await api.get("/admin/service-requests");
  return res.data;
};

export const updateServiceRequestStatus = async (id, status) => {
  const res = await api.put(`/admin/service-requests/${id}/status`, { status });
  return res.data;
};

// Events
export const getAdminEvents = async () => {
  const res = await api.get("/events");
  return res.data;
};

export const createEvent = async (data) => {
  const res = await api.post("/admin/events", data);
  return res.data;
};

export const updateEventStatus = async (id, status) => {
  const res = await api.put(`/admin/events/${id}/status`, { status });
  return res.data;
};

export const getEventRegistrations = async (eventId) => {
  const res = await api.get(`/admin/event-registrations/${eventId}`);
  return res.data;
};

// Announcements
export const getAdminAnnouncements = async () => {
  const res = await api.get("/admin/announcements");
  return res.data;
};

export const createAnnouncement = async (data) => {
  const res = await api.post("/admin/announcements", data);
  return res.data;
};

export const updateAnnouncementStatus = async (id, status) => {
  const res = await api.put(`/admin/announcements/${id}/status`, { status });
  return res.data;
};

// Clubhouse Facilities
export const getAdminClubhouseFacilities = async () => {
  const res = await api.get("/clubhouse/facilities");
  return res.data;
};

export const createClubhouseFacility = async (data) => {
  const res = await api.post("/admin/clubhouse/facilities", data);
  return res.data;
};

export const updateClubhouseFacilityStatus = async (id, status) => {
  const res = await api.put(`/admin/clubhouse/facilities/${id}/status`, { status });
  return res.data;
};

// Clubhouse Bookings
export const getAdminClubhouseBookings = async () => {
  const res = await api.get("/admin/clubhouse/bookings");
  return res.data;
};

export const updateClubhouseBookingStatus = async (id, status) => {
  const res = await api.put(`/admin/clubhouse/bookings/${id}/status`, { status });
  return res.data;
};
