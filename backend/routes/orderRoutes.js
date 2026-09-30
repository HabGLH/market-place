import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User Routes

router.post("/", authenticateToken, createOrder);
router.get("/my", authenticateToken, getUserOrders);
router.get("/:id", authenticateToken, getOrderById);
router.put("/:id/cancel", authenticateToken, cancelOrder);

// Admin Routes
router.get("/", authenticateToken, roleMiddleware(), getAllOrders);
router.put(
  "/:id/status",
  authenticateToken,
  roleMiddleware(),
  updateOrderStatus
);

export default router;
