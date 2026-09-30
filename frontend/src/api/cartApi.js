import axiosInstance from "./axiosInstance.js";

export const getCart = async () => {
  const response = await axiosInstance.get("/cart");
  return response.data; // cart details
};

export const addToCart = async (productId, quantity) => {
  const response = await axiosInstance.post("/cart/add", {
    productId,
    quantity,
  });
  return response.data; // updated cart
};

export const updateCartItem = async (productId, quantity) => {
  const response = await axiosInstance.put(`/cart/update/${productId}`, {
    quantity,
  });
  return response.data; // updated cart
};

export const removeCartItem = async (productId) => {
  const response = await axiosInstance.delete(`/cart/remove/${productId}`);
  return response.data; // updated cart
};

export const clearCart = async () => {
  const response = await axiosInstance.delete("/cart/clear");
  return response.data; // empty cart
};
