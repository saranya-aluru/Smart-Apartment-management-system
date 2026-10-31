import api from "./axios";

// Fetch all maintenance tickets assigned to the logged-in staff member
export const getStaffMaintenance = async () => {
  const res = await api.get("/staff/maintenance");
  return res.data;
};

// Fetch profile of the logged-in staff member
export const getStaffProfile = async () => {
  const res = await api.get("/staff/profile");
  return res.data;
};

// Update work order execution state: IN_PROGRESS or COMPLETED
export const updateStaffMaintenanceStatus = async (id, status) => {
  const res = await api.put(`/staff/maintenance/${id}/status`, { status });
  return res.data;
};
