import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  enableProduct,
  updateStock,
} from "../controllers/productController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =====================
   PUBLIC ROUTES
===================== */
router.get("/", getAllProducts); // GET /api/products

/* =====================
   ADMIN ROUTES (STATIC FIRST)
===================== */
router.get("/admin", authenticateToken, roleMiddleware(), getAdminProducts);

router.post("/", authenticateToken, roleMiddleware(), createProduct);

router.put("/:id/enable", authenticateToken, roleMiddleware(), enableProduct);
router.put("/:id/stock", authenticateToken, roleMiddleware(), updateStock);

/* =====================
   DYNAMIC ROUTES (LAST)
===================== */
router.get("/:id", getProductById);

router.put("/:id", authenticateToken, roleMiddleware(), updateProduct);

router.delete("/:id", authenticateToken, roleMiddleware(), deleteProduct);

export default router;
