import axiosInstance from "./axiosInstance";

export const createChapaCheckout = async (shippingAddress) => {
  const response = await axiosInstance.post("/payments/checkout", {
    paymentMethod: "chapa",
    shippingAddress,
  });
  return response.data;
};

export const getPaymentStatus = async (txRef) => {
  const response = await axiosInstance.get(`/payments/status/${txRef}`);
  return response.data;
};
