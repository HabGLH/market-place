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
import validateRequest from "../middleware/validateRequest.js";
import {
  createOrderSchema,
  orderIdParamsSchema,
  orderListQuerySchema,
  updateOrderStatusSchema,
} from "../validation/schemas.js";

const router = express.Router();

// User Routes

router.post(
  "/",
  authenticateToken,
  validateRequest({ body: createOrderSchema }),
  createOrder,
);
router.get("/my", authenticateToken, getUserOrders);
router.get(
  "/:id",
  authenticateToken,
  validateRequest({ params: orderIdParamsSchema }),
  getOrderById,
);
router.put(
  "/:id/cancel",
  authenticateToken,
  validateRequest({ params: orderIdParamsSchema }),
  cancelOrder,
);

// Admin Routes
router.get(
  "/",
  authenticateToken,
  roleMiddleware(),
  validateRequest({ query: orderListQuerySchema }),
  getAllOrders,
);
router.put(
  "/:id/status",
  authenticateToken,
  roleMiddleware(),
  validateRequest({
    params: orderIdParamsSchema,
    body: updateOrderStatusSchema,
  }),
  updateOrderStatus,
);

export default router;
