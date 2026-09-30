import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axiosInstance";

// Normalize role to string format
const normalizeRole = (role) => {
  // Backend might return numeric roles: 0 = user, 1 = admin
  if (role === 1 || role === "1") return "admin";
  if (role === 0 || role === "0") return "user";
  // Already a string
  return role?.toLowerCase() || "user";
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get current user (will use refresh token from cookie)
        const userData = await getCurrentUser();
        // Normalize the role and ensure user data is valid
        const normalizedUser =
          userData && typeof userData === "object"
            ? {
                ...userData,
                role: normalizeRole(userData.role),
                name: userData.name || "User",
                email: userData.email || "",
              }
            : null;

        setUser(normalizedUser);
      } catch (error) {
        // Not logged in - this is fine
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    // Ensure user data is valid
    if (!data?.user) {
      throw new Error("Invalid login response");
    }
    // Normalize the role
    const normalizedUser = {
      ...data.user,
      role: normalizeRole(data.user.role),
      name: data.user.name || "User",
      email: data.user.email || "",
    };

    setAccessToken(data.accessToken);
    setUser(normalizedUser);
    return data;
  };

  const register = async (userData) => {
    const data = await apiRegister(userData);
    // Ensure user data is valid
    if (!data?.user) {
      throw new Error("Invalid register response");
    }
    // Normalize the role
    const normalizedUser = {
      ...data.user,
      role: normalizeRole(data.user.role),
      name: data.user.name || "User",
      email: data.user.email || "",
    };

    setAccessToken(data.accessToken);
    setUser(normalizedUser);
    return data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
