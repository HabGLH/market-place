// orderApi.js
// Responsibilities

// Order lifecycle

// Functions Design
// orderApi.js
// │
// ├── createOrder(orderData)
// ├── getMyOrders()
// ├── getOrderById(id)
// ├── cancelOrder(id)
// │
// └── // ADMIN
//     ├── getAllOrders()
//     ├── updateOrderStatus(id, status)
import axiosInstance from "./axiosInstance.js";

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post("/orders", orderData);
  return response.data; // created order
};

export const getMyOrders = async (queryParams) => {
  const response = await axiosInstance.get("/orders/my", {
    params: queryParams,
  });
  return response.data; // list of user's orders
};

export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data; // order details
};

export const cancelOrder = async (id) => {
  const response = await axiosInstance.put(`/orders/${id}/cancel`);
  return response.data; // cancellation confirmation
};

// ADMIN

export const getAllOrders = async (queryParams) => {
  // queryParams can contain { status, page, limit }
  const response = await axiosInstance.get("/orders", { params: queryParams });
  return response.data; // list of all orders
};

export const updateOrderStatus = async (id, status) => {
  const response = await axiosInstance.put(`/orders/${id}/status`, { status });
  return response.data; // updated order
};
