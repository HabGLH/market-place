import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import asyncHandler from "express-async-handler"; // Middleware to handle async errors
import AppError from "../utils/AppError.js";

// Create order from cart
export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // Calculate total price
  let totalAmount = 0;
  const orderProducts = cart.items.map((item) => {
    totalAmount += item.product.price * item.quantity;
    return {
      productId: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      totalPrice: item.product.price * item.quantity,
    };
  });

  // Create order
  const order = new Order({
    userId: req.user.id,
    products: orderProducts,
    totalAmount,
    paymentMethod: req.body.paymentMethod || "Credit Card",
  });

  const createdOrder = await order.save();

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json(createdOrder);
});

//get user orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
});

//get order by id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "products.productId"
  );
  if (order && order.userId.toString() === req.user.id) {
    res.json(order);
  } else {
    throw new AppError("Order not found", 404);
  }
});

//cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.userId.toString() === req.user.id) {
    if (order.orderStatus === "Pending") {
      order.orderStatus = "Cancelled";
      await order.save();
      res.json({ message: "Order cancelled" });
    } else {
      throw new AppError("Cannot cancel order at this stage", 400);
    }
  } else {
    throw new AppError("Order not found", 404);
  }
});

//get all orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const filter = status ? { orderStatus: status } : {};

  const orders = await Order.find(filter).populate("products.productId");
  res.json(orders);
});

//update order status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (order) {
    order.orderStatus = status;
    await order.save();
    res.json(order);
  } else {
    throw new AppError("Order not found", 404);
  }
});
