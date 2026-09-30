import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Calculate total revenue
  const revenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  // Low stock products
  const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select(
    "name stock price"
  );

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts,
  });
});
