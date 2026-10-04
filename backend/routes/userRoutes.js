import express from "express";
import {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  disableUser,
  enableUser,
  updateUserRole,
  getUserOrders,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { updateMeSchema } from "../validation/schemas.js";

const router = express.Router();

// Self-service routes (Logged-in User)
router
  .route("/me")
  .get(authenticateToken, getMe) // Get logged-in user profile
  .put(authenticateToken, validateRequest({ body: updateMeSchema }), updateMe); // Update logged-in user profile

// Admin-only routes
router.route("/").get(authenticateToken, roleMiddleware(), getAllUsers); // Admin: list users

router
  .route("/:id")
  .get(authenticateToken, roleMiddleware(), getUserById); // Admin: get user details by ID

router.put("/:id/disable", authenticateToken, roleMiddleware(), disableUser);
router.put("/:id/enable", authenticateToken, roleMiddleware(), enableUser);
router.put("/:id/role", authenticateToken, roleMiddleware(), updateUserRole);
router.get("/:id/orders", authenticateToken, roleMiddleware(), getUserOrders);

export default router;
