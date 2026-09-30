//userRout.js
import express from "express";
import {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  disableUser,
  enableUser,
  getUserOrders,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Self-service routes (Logged-in User)
router
  .route("/me")
  .get(authenticateToken, getMe) // Get logged-in user profile
  .put(authenticateToken, updateMe); // Update logged-in user profile

// Admin-only routes
router.route("/").get(authenticateToken, roleMiddleware(), getAllUsers); // Admin: list users

router
  .route("/:id")
  .get(authenticateToken, roleMiddleware(), getUserById) // Admin: get user details by ID
  .put(authenticateToken, roleMiddleware(), disableUser); // Admin: block user

router.put("/:id/enable", authenticateToken, roleMiddleware(), enableUser);
router.get("/:id/orders", authenticateToken, roleMiddleware(), getUserOrders);

export default router;
