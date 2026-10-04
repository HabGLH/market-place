import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import asyncHandler from "express-async-handler"; // Middleware to handle async errors
import AppError from "../utils/AppError.js";
import { restoreStock } from "../services/orderService.js";

//get user orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
});

//get order by id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "products.productId",
  );
  if (order && order.userId.toString() === req.user.id) {
    res.json(order);
  } else {
    throw new AppError("Order not found", 404);
  }
});

//cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
      paymentMethod: "cod",
      paymentStatus: "Pending",
      orderStatus: "Processing",
    },
    { $set: { paymentStatus: "Failed", orderStatus: "Cancelled" } },
    { new: true },
  );

  if (!order) {
    const existingOrder = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!existingOrder) throw new AppError("Order not found", 404);
    throw new AppError("Cannot cancel order at this stage", 400);
  }

  await restoreStock(order.products);
  await Payment.updateOne(
    { txRef: order.txRef, status: "Pending" },
    { $set: { status: "Failed", rawPayload: { reason: "Order cancelled" } } },
  );

  res.json({ message: "Order cancelled" });
});

//get all orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const filter = status ? { orderStatus: status } : {};

  const orders = await Order.find(filter)
    .populate("products.productId")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// Allowed order status transitions
const ALLOWED_TRANSITIONS = {
  Pending: ["Processing", "Cancelled", "Failed"],
  Processing: ["Shipped", "Cancelled", "Failed"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
  Failed: [],
};

//update order status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (order) {
    const allowed = ALLOWED_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(status)) {
      throw new AppError(
        `Invalid order status transition from '${order.orderStatus}' to '${status}'`,
        400,
      );
    }
    order.orderStatus = status;
    await order.save();
    res.json(order);
  } else {
    throw new AppError("Order not found", 404);
  }
});
