import express from "express";
import {
  getDashboardStats,
  getActivityLogs,
  updateProductStock,
  bulkImportProducts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin Dashboard stats & logs
router.get("/stats", authenticateToken, roleMiddleware(), getDashboardStats);
router.get("/logs", authenticateToken, roleMiddleware(), getActivityLogs);

// Stock & Bulk Operations
router.patch("/products/:id/stock", authenticateToken, roleMiddleware(), updateProductStock);
router.post("/products/import", authenticateToken, roleMiddleware(), bulkImportProducts);

// Category Management
router.get("/categories", getCategories);
router.post("/categories", authenticateToken, roleMiddleware(), createCategory);
router.put("/categories/:id", authenticateToken, roleMiddleware(), updateCategory);
router.delete("/categories/:id", authenticateToken, roleMiddleware(), deleteCategory);

export default router;
