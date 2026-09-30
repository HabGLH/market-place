import crypto from "crypto";

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    path: "/", // root path so it's sent to /api/auth/refresh and /api/auth/logout
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds (matches typical refresh expiry)
  };
};

// Generate a random opaque token
export const generateOpaqueToken = () => {
  return crypto.randomBytes(40).toString("hex");
};
