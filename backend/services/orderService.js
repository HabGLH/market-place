import { randomUUID } from "node:crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { calculateOrderTotals, roundMoney } from "./pricing.js";

export const restoreStock = async (products) => {
  await Promise.all(
    products.map(({ productId, quantity }) =>
      Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }),
    ),
  );
};

export const decrementStock = async (products) => {
  const decremented = [];

  for (const item of products) {
    const product = await Product.findOneAndUpdate(
      { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );

    if (!product) {
      await restoreStock(decremented);
      return false;
    }
    decremented.push(item);
  }

  return true;
};

export const createOrderFromCart = async ({
  userId,
  paymentMethod,
  shippingAddress,
}) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );

  let subtotal = 0;
  const orderProducts = cart.items.map((item) => {
    const productId = item.product.toString();
    const product = productsById.get(productId);
    if (!product) throw new AppError("Product is no longer available", 409);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 409);
    }

    const lineTotal = roundMoney(product.price * item.quantity);
    subtotal += lineTotal;
    return {
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      totalPrice: lineTotal,
    };
  });

  const totals = calculateOrderTotals(roundMoney(subtotal));
  const txRef = `marketplace-${randomUUID()}`;
  const order = await Order.create({
    userId,
    products: orderProducts,
    ...totals,
    paymentMethod,
    paymentStatus: "Pending",
    txRef,
    shippingAddress,
    orderStatus: "Processing",
  });

  try {
    await Payment.create({
      userId,
      orderId: order._id,
      amount: totals.totalAmount,
      currency: "ETB",
      provider: paymentMethod,
      txRef,
      status: "Pending",
    });
  } catch (error) {
    await Order.deleteOne({ _id: order._id });
    throw error;
  }

  return { order, cart, totals, txRef, orderProducts };
};

export const clearCart = async (cart) => {
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();
};

export const failPayment = async (payment, order, rawPayload) => {
  payment.status = "Failed";
  payment.rawPayload = rawPayload;
  await payment.save();
  order.paymentStatus = "Failed";
  order.orderStatus = "Failed";
  await order.save();
};

export const completePayment = async ({
  payment,
  order,
  rawPayload,
  providerRef,
}) => {
  if (payment.status === "Success" || order.paymentStatus === "Paid") {
    return { alreadyPaid: true };
  }

  const claim = await Payment.findOneAndUpdate(
    { _id: payment._id, status: "Pending", processingAt: null },
    { $set: { processingAt: new Date() } },
    { new: true },
  );
  if (!claim) return { alreadyProcessing: true };

  const stockUpdated = await decrementStock(order.products);
  if (!stockUpdated) {
    await failPayment(claim, order, rawPayload);
    return { insufficientStock: true };
  }

  claim.status = "Success";
  claim.providerRef = providerRef;
  claim.rawPayload = rawPayload;
  await claim.save();
  order.paymentStatus = "Paid";
  order.orderStatus = "Processing";
  await order.save();
  return { paid: true };
};
