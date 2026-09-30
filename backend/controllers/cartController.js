import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";

const recalculateTotalPrice = async (cart) => {
  await cart.populate("items.product");
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
};

// Fetch current cart
// Fetch current cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate(
    "items.product",
  );
  if (!cart) {
    return res.json({ items: [], totalPrice: 0 });
  }
  res.json(cart);
});

// Add product to cart

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [], totalPrice: 0 });
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  let newQuantity = parseInt(quantity, 10);
  if (itemIndex > -1) {
    newQuantity += cart.items[itemIndex].quantity;
  }

  if (product.stock < newQuantity) {
    throw new AppError("Insufficient stock available", 400);
  }

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await recalculateTotalPrice(cart);

  await cart.save();
  res.json(cart);
});

// Update product quantity
export const updateQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );
  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product || product.stock < quantity) {
        throw new AppError("Product not available", 400);
      }
      cart.items[itemIndex].quantity = quantity;
    }
    await recalculateTotalPrice(cart);
    await cart.save();
    res.json(cart);
  } else {
    throw new AppError("Item not found in cart", 404);
  }
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    throw new AppError("Cart not found", 404);
  }
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await recalculateTotalPrice(cart);

  await cart.save();
  res.json(cart);
});

// Clear cart after checkout
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (cart) {
    cart.items = [];
    cart.totalPrice = 0; // Reset totalPrice to 0
    await cart.save();
  }
  res.json({ message: "Cart cleared" });
});
