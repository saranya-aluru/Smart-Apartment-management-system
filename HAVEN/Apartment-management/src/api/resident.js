import api from "./axios";

export const getResidentDashboard = async () => {
  const res = await api.get("/resident/dashboard");
  return res.data;
};

export const getResidentProfile = async () => {
  const res = await api.get("/resident/profile");
  return res.data;
};

export const getResidentMaintenance = async () => {
  const res = await api.get("/resident/maintenance");
  return res.data;
};

export const createResidentMaintenance = async (data) => {
  const res = await api.post("/resident/maintenance", data);
  return res.data;
};

export const getResidentServiceRequests = async () => {
  const res = await api.get("/resident/service-requests");
  return res.data;
};

export const createResidentServiceRequest = async (data) => {
  const res = await api.post("/resident/service-requests", data);
  return res.data;
};

export const registerForEvent = async (eventId) => {
  const res = await api.post(`/resident/events/${eventId}/register`);
  return res.data;
};

export const getResidentEventRegistrations = async () => {
  const res = await api.get("/resident/event-registrations");
  return res.data;
};

export const getResidentClubhouseBookings = async () => {
  const res = await api.get("/resident/clubhouse/bookings");
  return res.data;
};

export const createResidentClubhouseBooking = async (data) => {
  const res = await api.post("/resident/clubhouse/bookings", data);
  return res.data;
};

export const cancelResidentClubhouseBooking = async (id) => {
  const res = await api.put(`/resident/clubhouse/bookings/${id}/cancel`);
  return res.data;
};
