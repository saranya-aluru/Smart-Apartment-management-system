import api from "./axios";

export const getPublicApartments = async (status) => {
  const url = status ? `/apartments?status=${encodeURIComponent(status)}` : "/apartments";
  const res = await api.get(url);
  return res.data;
};

export const getPublicServices = async () => {
  const res = await api.get("/services");
  return res.data;
};

export const getPublicEvents = async () => {
  const res = await api.get("/events");
  return res.data;
};

export const getPublicAnnouncements = async () => {
  const res = await api.get("/announcements");
  return res.data;
};

export const getPublicClubhouseFacilities = async () => {
  const res = await api.get("/clubhouse/facilities");
  return res.data;
};
