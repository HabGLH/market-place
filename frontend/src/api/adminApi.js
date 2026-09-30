import axiosInstance from "./axiosInstance";

export const getAdminStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  // Normalize data: check for .stats or .data wrappers
  return response.data.stats || response.data.data || response.data || {};
};
