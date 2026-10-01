import User from "../models/User.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import {
  clearCart,
  createOrderFromCart,
  decrementStock,
  failPayment,
} from "../services/orderService.js";
import { settleVerifiedPayment } from "../services/payments/settlePayment.js";

const checkoutPayload = ({ user, shippingAddress, txRef, totalAmount }) => {
  const nameParts = shippingAddress.fullName.trim().split(/\s+/);
  const firstName = nameParts.shift();
  const lastName = nameParts.join(" ") || firstName;

  return {
    amount: totalAmount.toFixed(2),
    currency: "ETB",
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    phone_number: shippingAddress.phone.replace(/^\+251/, "0"),
    tx_ref: txRef,
    return_url: `${process.env.CLIENT_URL.replace(/\/$/, "")}/payment/return?txRef=${encodeURIComponent(txRef)}`,
  };
};

export const createPaymentController = (provider) => ({
  checkout: asyncHandler(async (req, res) => {
    const { order, cart, totals, txRef } = await createOrderFromCart({
      userId: req.user.id,
      paymentMethod: "chapa",
      shippingAddress: req.body.shippingAddress,
    });

    try {
      const user = await User.findById(req.user.id);
      const response = await provider.initialize(
        checkoutPayload({
          user,
          shippingAddress: req.body.shippingAddress,
          txRef,
          totalAmount: totals.totalAmount,
        }),
      );
      const checkoutUrl = response?.data?.checkout_url;
      if (!checkoutUrl) throw new Error("Chapa did not return checkout_url");

      res.status(201).json({ checkoutUrl, orderId: order.id, txRef });
    } catch (error) {
      const payment = await Payment.findOne({ txRef });
      await failPayment(payment, order, { message: error.message });
      throw new AppError("Unable to initialize Chapa checkout", 502);
    }
  }),

  webhook: asyncHandler(async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      throw new AppError("Expected raw webhook body", 400);
    }
    if (!provider.verifyWebhook(req.body, req.headers)) {
      throw new AppError("Invalid webhook signature", 401);
    }

    let payload;
    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch {
      throw new AppError("Invalid webhook JSON", 400);
    }

    const txRef = payload.tx_ref || payload.trx_ref || payload.data?.tx_ref;
    if (typeof txRef !== "string" || txRef.length === 0) {
      throw new AppError("Webhook transaction reference is missing", 400);
    }

    const result = await settleVerifiedPayment({
      provider,
      txRef,
      webhookPayload: payload,
    });
    res.status(200).json({
      received: true,
      status: result.paid || result.duplicate ? "paid" : "processed",
    });
  }),

  status: asyncHandler(async (req, res) => {
    const order = await Order.findOne({
      txRef: req.params.txRef,
      userId: req.user.id,
    }).select("txRef paymentStatus orderStatus totalAmount currency");
    if (!order) throw new AppError("Order not found", 404);
    res.json(order);
  }),
});

export const createCodOrder = asyncHandler(async (req, res) => {
  const { order, cart } = await createOrderFromCart({
    userId: req.user.id,
    paymentMethod: "cod",
    shippingAddress: req.body.shippingAddress,
  });
  const payment = await Payment.findOne({ txRef: order.txRef });

  if (!(await decrementStock(order.products))) {
    await failPayment(payment, order, {
      reason: "Insufficient stock at order creation",
    });
    throw new AppError("Insufficient stock to fulfill order", 409);
  }

  await clearCart(cart);
  res.status(201).json(order);
});

export const settleChapaPayment = (provider, txRef, webhookPayload) =>
  settleVerifiedPayment({ provider, txRef, webhookPayload });
