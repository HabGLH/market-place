import axios from "axios";
import config from "../config/env.js";

let accessToken = null; // In-memory access token

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
});

// Function to set the access token
export const setAccessToken = (token) => {
  accessToken = token;
};

// Function to clear the access token
export const clearAccessToken = () => {
  accessToken = null;
};

// Request interceptor to attach the access token
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and refresh token flow
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${config.API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = response.data.accessToken;

        // Update the in-memory access token
        setAccessToken(newAccessToken);

        // Update the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear the access token
        clearAccessToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
