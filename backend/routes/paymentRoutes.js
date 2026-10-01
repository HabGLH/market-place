import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  paymentCheckoutSchema,
  paymentStatusParamsSchema,
} from "../validation/schemas.js";
import { createPaymentController } from "../controllers/paymentController.js";
import ChapaProvider from "../services/payments/ChapaProvider.js";

const router = express.Router();
export const paymentProvider = new ChapaProvider();
const controller = createPaymentController(paymentProvider);

router.post(
  "/checkout",
  authenticateToken,
  validateRequest({ body: paymentCheckoutSchema }),
  controller.checkout,
);
router.get(
  "/status/:txRef",
  authenticateToken,
  validateRequest({ params: paymentStatusParamsSchema }),
  controller.status,
);

export const webhookHandler = controller.webhook;
export default router;
