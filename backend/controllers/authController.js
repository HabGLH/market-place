import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import asyncHandler from "express-async-handler";
import {
  hashToken,
  getCookieOptions,
  generateOpaqueToken,
} from "../utils/authUtils.js";
import AppError from "../utils/AppError.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
// REFRESH_TOKEN_SECRET is no longer needed for signing if we use opaque tokens,
// but we keep it if we want to sign them or for other purposes.
// For opaque tokens, we just need opacity.
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_LIFE || "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 10; // 10 days
const SALT_ROUNDS = 10;

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
};

// Register controller
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const ipAddress = req.ip;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  // Generate tokens
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateOpaqueToken();

  // Save refresh token to DB
  await RefreshToken.create({
    userId: newUser.id,
    token: hashToken(refreshToken),
    expiresAt: new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    ),
    createdByIp: ipAddress,
  });

  // Set cookie
  res.cookie("refreshToken", refreshToken, getCookieOptions());

  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    },
    accessToken,
  });
});

// Login controller
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not exist", 400);
  }
  if (user.isActive === false) {
    throw new AppError("Account is disabled", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 400);
  }

  // Cleanup existing session if present
  if (req.cookies.refreshToken) {
    const existingHashedToken = hashToken(req.cookies.refreshToken);
    await RefreshToken.deleteOne({ token: existingHashedToken });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateOpaqueToken();

  // Save refresh token to DB
  await RefreshToken.create({
    userId: user.id,
    token: hashToken(refreshToken),
    expiresAt: new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    ),
    createdByIp: ipAddress,
  });

  // Set cookie
  res.cookie("refreshToken", refreshToken, getCookieOptions());

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
  });
});

// Refresh controller with Rotation and Reuse Detection
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const ipAddress = req.ip;

  if (!refreshToken) {
    throw new AppError("No token provided", 401);
  }

  const hashed = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({ token: hashed });

  if (!storedToken) {
    throw new AppError("Invalid token", 403);
  }

  // Reuse Detection
  if (storedToken.revokedAt) {
    // Token was already revoked! This is a reuse attempt.
    // Revoke all tokens for this user because their family of tokens is compromised.
    await RefreshToken.updateMany(
      { userId: storedToken.userId },
      {
        revokedAt: new Date(),
        reason: "Reuse detection triggered",
        revokedByIp: ipAddress,
      },
    );
    // return res.status(403).json({ message: "Token reused - Re-login required" });
    // Using AppError to bubble up. The original code returned, so we throw to stop execution.
    throw new AppError("Token reused - Re-login required", 403);
  }

  // Check expiry
  if (storedToken.expiresAt < new Date()) {
    storedToken.revokedAt = new Date();
    storedToken.reason = "Expired";
    await storedToken.save();
    throw new AppError("Token expired", 403);
  }

  const user = await User.findById(storedToken.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.isActive === false) {
    throw new AppError("Account is disabled", 403);
  }

  // Rotation Logic (In-place update):
  const newRefreshToken = generateOpaqueToken();
  const newHashedToken = hashToken(newRefreshToken);

  storedToken.token = newHashedToken;
  storedToken.expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );
  storedToken.revokedAt = null; // Ensure it's active
  storedToken.reason = null;
  await storedToken.save();

  // 3. Send new tokens
  const accessToken = generateAccessToken(user);
  res.cookie("refreshToken", newRefreshToken, getCookieOptions());

  res.status(200).json({ accessToken });
});

// Logout controller
// Logout controller
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const ipAddress = req.ip;

  if (refreshToken) {
    const hashed = hashToken(refreshToken);
    await RefreshToken.findOneAndUpdate(
      { token: hashed },
      {
        revokedAt: new Date(),
        reason: "Logout",
        revokedByIp: ipAddress,
      },
    );
  }

  // Always clear cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// Revoke Token (Manual)
export const revokeToken = asyncHandler(async (req, res) => {
  // This could be admin only or user self-revocation (e.g. "Simulate logout other devices")
  // For now, let's assume it accepts a token to revoke (maybe passed in body?)
  // Or maybe it revokes ALL tokens for the current user?
  // Let's implement "Revoke all other sessions" style?
  // Based on req.user.id (from auth middleware)

  // NOTE: This requires this route to be protected by authMiddleware
  const userId = req.user.id;
  const ipAddress = req.ip;

  await RefreshToken.updateMany(
    { userId: userId, revokedAt: null },
    {
      revokedAt: new Date(),
      reason: "User requested revocation",
      revokedByIp: ipAddress,
    },
  );
  res.status(200).json({ message: "All sessions revoked" });
});
