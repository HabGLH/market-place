import axiosInstance from "./axiosInstance";

export const getAdminStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data.stats || response.data.data || response.data || {};
};

export const getActivityLogs = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get(`/admin/logs?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateProductStock = async (productId, stock) => {
  const response = await axiosInstance.patch(`/admin/products/${productId}/stock`, { stock });
  return response.data;
};

export const bulkImportProducts = async (products) => {
  const response = await axiosInstance.post("/admin/products/import", { products });
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosInstance.get("/admin/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axiosInstance.post("/admin/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await axiosInstance.put(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/admin/categories/${id}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const disableUser = async (userId) => {
  const response = await axiosInstance.put(`/users/${userId}/disable`);
  return response.data;
};

export const enableUser = async (userId) => {
  const response = await axiosInstance.put(`/users/${userId}/enable`);
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
