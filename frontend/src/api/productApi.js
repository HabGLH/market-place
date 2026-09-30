// productApi.js
// Responsibilities

// Product-related operations

// Functions Design
// productApi.js
// │
// ├── getProducts(query)
// ├── getProductById(id)
// ├── createProduct(data)      // admin
// ├── updateProduct(id, data)  // admin
// ├── deleteProduct(id)        // admin

import axiosInstance from "./axiosInstance.js";

export const getProducts = async (queryParams) => {
  const response = await axiosInstance.get("/products", {
    params: queryParams,
  });
  const data = response.data;
  if (Array.isArray(data)) {
    return { items: data, page: 1, pages: 1, total: data.length };
  }

  const items = data?.items ?? data?.products ?? data?.data;
  return {
    ...data,
    items: Array.isArray(items) ? items : [],
    page: data?.page ?? 1,
    pages: data?.pages ?? data?.totalPages ?? data?.last_page ?? 1,
    total: data?.total ?? data?.totalCount ?? data?.count ?? items?.length ?? 0,
  };
};

export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data; // product details
};

export const createProduct = async (data) => {
  const response = await axiosInstance.post("/products", data);
  return response.data; // created product
};

export const updateProduct = async (id, data) => {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data; // updated product
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data; // success message
};
