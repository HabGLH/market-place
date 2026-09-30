import express from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:productId", updateQuantity);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
