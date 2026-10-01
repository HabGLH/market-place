import User from "../models/User.js";
import Order from "../models/Order.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (user) {
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
        throw new AppError("Current password is incorrect", 401);
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

// @desc    Admin: List all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
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
  const user = await User.findById(req.params.id);
  if (user) {
    user.isActive = false;
    await user.save();
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
    await user.save();
    res.json({ message: "User enabled successfully" });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Admin: Get specific user orders
// @route   GET /api/users/:id/orders
// @access  Private/Admin
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.params.id });
  res.json(orders);
});
