// userApi.js
// Responsibilities

// Authenticated user data actions

// Functions Design
// userApi.js
// │
// ├── getProfile()
// ├── updateProfile(data)
// ├── changePassword(data)

import axiosInstance from "./axiosInstance.js";

export const getProfile = async () => {
  const response = await axiosInstance.get("/users/me");
  return response.data; // user profile
};

export const updateProfile = async (data) => {
  const response = await axiosInstance.put("/users/me", data);
  return response.data; // updated user profile
};

export const changePassword = async (data) => {
  const response = await axiosInstance.put("/users/me/password", data);
  return response.data; // success message
};

// ADMIN

export const getUsers = async () => {
  const response = await axiosInstance.get("/users");
  return response.data; // list of users
};

export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data; // user details
};

export const disableUser = async (id) => {
  const response = await axiosInstance.put(`/users/${id}/disable`);
  return response.data;
};

export const enableUser = async (id) => {
  const response = await axiosInstance.put(`/users/${id}/enable`);
  return response.data;
};
