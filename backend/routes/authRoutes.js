// implementation of authentication routes
// Register → creates user + issues tokens
// Login → verifies password + issues tokens
// Refresh → rotates refresh token
// Logout → revokes refresh token
import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  revokeToken,
} from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validateRequest({ body: registerSchema }),
  register,
);
router.post(
  "/login",
  authLimiter,
  validateRequest({ body: loginSchema }),
  login,
);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);
router.post("/revoke", authenticateToken, revokeToken);

export default router;
