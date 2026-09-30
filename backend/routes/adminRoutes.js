import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin Dashboard stats
router.get("/stats", authenticateToken, roleMiddleware(), getDashboardStats);

export default router;
