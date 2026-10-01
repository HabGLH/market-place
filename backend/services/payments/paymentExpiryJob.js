import cron from "node-cron";
import Order from "../../models/Order.js";
import Payment from "../../models/Payment.js";
import logger from "../../utils/logger.js";
import { failPayment } from "../orderService.js";
import { settleVerifiedPayment } from "./settlePayment.js";

export const runPaymentExpiryCheck = async (provider, now = Date.now()) => {
  const staleClaimCutoff = new Date(now - 15 * 60 * 1000);
  await Payment.updateMany(
    {
      provider: "chapa",
      status: "Pending",
      processingAt: { $lte: staleClaimCutoff },
    },
    { $set: { processingAt: null } },
  );

  const verificationCutoff = new Date(now - 15 * 60 * 1000);
  const payments = await Payment.find({
    provider: "chapa",
    status: "Pending",
    createdAt: { $lte: verificationCutoff },
  });

  for (const payment of payments) {
    try {
      const result = await settleVerifiedPayment({
        provider,
        txRef: payment.txRef,
        webhookPayload: null,
      });
      const expirationCutoff = now - 24 * 60 * 60 * 1000;
      if (result.pending && payment.createdAt.getTime() <= expirationCutoff) {
        const order = await Order.findById(payment.orderId);
        if (order)
          await failPayment(payment, order, { reason: "Payment expired" });
      }
    } catch (error) {
      logger.error(
        `Pending payment check failed for ${payment.txRef}: ${error.message}`,
      );
    }
  }
};

export const startPaymentExpiryJob = (provider) =>
  cron.schedule("*/5 * * * *", () => runPaymentExpiryCheck(provider));
