// authApi.js
// Responsibilities

// Authentication endpoints only

// Functions Design
// authApi.js
// │
// ├── login(credentials)
// ├── register(data)
// ├── logout()
// ├── refreshToken()
// ├── getCurrentUser()

// ✅ refreshToken() uses cookies automatically
// ✅ Returns new accessToken
import axiosInstance from "./axiosInstance.js";

export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  return response.data; // { accessToken, user }
};

export const register = async (data) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data; // { accessToken, user }
};

export const logout = async () => {
  await axiosInstance.post("/auth/logout");
};

export const refreshToken = async () => {
  const response = await axiosInstance.post("/auth/refresh");
  return response.data; // { accessToken }
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/users/me");
  return response.data; // user profile
};
