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
  return response.data; // list of products
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
