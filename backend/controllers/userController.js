import User from "../models/User.js";
import Order from "../models/Order.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import bcrypt from "bcryptjs";
import { logActivity } from "../utils/activityLogger.js";

const SALT_ROUNDS = 10;

import RefreshToken from "../models/RefreshToken.js";

// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (user) {
    if (user.isActive === false) throw new AppError("Account is disabled", 403);
    res.json(user);
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Update logged-in user profile
// @route   PUT /api/users/me
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    const emailChanged = req.body.email && req.body.email !== user.email;
    const passwordChanged = Boolean(req.body.password);

    if (emailChanged || passwordChanged) {
      if (!req.body.currentPassword) {
        throw new AppError("Current password is required", 400);
      }
      const currentPasswordMatches = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!currentPasswordMatches) {
        throw new AppError("Current password is incorrect", 400);
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Admin: List all users with aggregated stats
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  
  // Aggregate user order stats
  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
      },
    },
  ]);

  const statsMap = {};
  orderStats.forEach((s) => {
    statsMap[s._id?.toString()] = s;
  });

  const usersWithStats = users.map((user) => {
    const uObj = user.toObject();
    const stats = statsMap[user._id.toString()] || { totalOrders: 0, totalSpent: 0 };
    uObj.totalOrders = stats.totalOrders;
    uObj.totalSpent = stats.totalSpent;
    return uObj;
  });

  res.json(usersWithStats);
});

// @desc    Admin: Get user details by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Admin: Disable (block) a user
// @route   PUT /api/users/:id/disable
// @access  Private/Admin
export const disableUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    throw new AppError("You cannot disable your own account", 400);
  }

  const user = await User.findById(req.params.id);
  if (user) {
    user.isActive = false;
    user.status = "inactive";
    await user.save();
    
    await RefreshToken.updateMany(
      { userId: user._id },
      {
        revokedAt: new Date(),
        reason: "User disabled by admin",
        revokedByIp: req.ip,
      }
    );

    await logActivity({
      userId: req.user.id,
      action: "DISABLE_USER",
      details: `Disabled user '${user.email}'`,
      entityType: "User",
      entityId: user._id,
      req,
    });

    res.json({ message: "User disabled successfully" });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Admin: Enable (unblock) a user
// @route   PUT /api/users/:id/enable
// @access  Private/Admin
export const enableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isActive = true;
    user.status = "active";
    await user.save();

    await logActivity({
      userId: req.user.id,
      action: "ENABLE_USER",
      details: `Enabled user '${user.email}'`,
      entityType: "User",
      entityId: user._id,
      req,
    });

    res.json({ message: "User enabled successfully" });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Admin: Update user role (0: User, 1: Admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (role === undefined || ![0, 1].includes(Number(role))) {
    throw new AppError("Invalid role value (0 or 1)", 400);
  }

  const user = await User.findById(req.params.id);
  if (user) {
    user.role = Number(role);
    await user.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE_USER_ROLE",
      details: `Updated role of '${user.email}' to ${role === 1 ? "Admin" : "User"}`,
      entityType: "User",
      entityId: user._id,
      req,
    });

    res.json({ message: "User role updated successfully", role: user.role });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Admin: Get specific user orders
// @route   GET /api/users/:id/orders
// @access  Private/Admin
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 });
  res.json(orders);
});
