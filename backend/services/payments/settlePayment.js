import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Payment from "../../models/Payment.js";
import AppError from "../../utils/AppError.js";
import { clearCart, completePayment, failPayment } from "../orderService.js";

const cents = (amount) => Math.round(Number(amount) * 100);

export const settleVerifiedPayment = async ({
  provider,
  txRef,
  webhookPayload,
}) => {
  const payment = await Payment.findOne({ txRef });
  if (!payment) throw new AppError("Payment not found", 404);

  const order = await Order.findById(payment.orderId);
  if (!order) throw new AppError("Order not found", 404);

  if (payment.status === "Success" || order.paymentStatus === "Paid") {
    return { duplicate: true, order };
  }
  if (payment.status !== "Pending") return { terminal: true, order };

  const verificationResponse = await provider.verify(txRef);
  const verification = verificationResponse?.data ?? verificationResponse;
  const status = String(verification?.status || "").toLowerCase();
  const verifiedTxRef = verification?.tx_ref || verification?.trx_ref;
  const matchesOrder =
    verifiedTxRef === order.txRef &&
    String(verification?.currency || "").toUpperCase() === "ETB" &&
    cents(verification?.amount) === cents(order.totalAmount);

  if (status === "success" && matchesOrder) {
    const result = await completePayment({
      payment,
      order,
      rawPayload: {
        webhook: webhookPayload,
        verification: verificationResponse,
      },
      providerRef: verification.reference || verification.ref_id,
    });

    if (result.paid) {
      const cart = await Cart.findOne({ userId: order.userId });
      if (cart) await clearCart(cart);
      return { paid: true, order };
    }
    return { ...result, order };
  }

  if (["failed", "cancelled", "canceled", "expired"].includes(status)) {
    await failPayment(payment, order, {
      webhook: webhookPayload,
      verification: verificationResponse,
    });
    return { failed: true, order };
  }

  if (status === "success" && !matchesOrder) {
    await failPayment(payment, order, {
      webhook: webhookPayload,
      verification: verificationResponse,
      reason:
        "Verified transaction did not match expected amount, currency, or reference",
    });
    return { mismatch: true, order };
  }

  return { pending: true, order };
};
