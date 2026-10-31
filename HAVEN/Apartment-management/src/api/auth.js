import api from "./axios";

export const getAvailableApartments = async () => {
  const response = await api.get("/auth/apartments");
  return response.data;
};

export const registerResident = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};
