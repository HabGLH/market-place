import express from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  addToCartSchema,
  cartProductIdParamsSchema,
  updateCartSchema,
} from "../validation/schemas.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/", getCart);
router.post("/add", validateRequest({ body: addToCartSchema }), addToCart);
router.put(
  "/update/:productId",
  validateRequest({
    params: cartProductIdParamsSchema,
    body: updateCartSchema.pick({ quantity: true }),
  }),
  updateQuantity,
);
router.delete(
  "/remove/:productId",
  validateRequest({ params: cartProductIdParamsSchema }),
  removeFromCart,
);
router.delete("/clear", clearCart);

export default router;
