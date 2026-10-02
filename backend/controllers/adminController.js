import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import { logActivity } from "../utils/activityLogger.js";

// @desc    Get dashboard statistics with full analytics
// @route   GET /api/admin/stats
// @access  Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Calculate total revenue
  const revenueAgg = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  // Low stock & out of stock products
  const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select(
    "name stock price images category"
  );
  const outOfStockCount = await Product.countDocuments({ stock: 0 });

  // Monthly Revenue Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Order status distribution
  const orderStatusDistribution = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Category distribution
  const categoryDistribution = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent activity logs
  const recentLogs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("userId", "name email");

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    outOfStockCount,
    recentOrders,
    lowStockProducts,
    monthlySales,
    orderStatusDistribution,
    categoryDistribution,
    recentLogs,
  });
});

// @desc    Get Activity Logs
// @route   GET /api/admin/logs
// @access  Admin
export const getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await ActivityLog.countDocuments();
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name email role");

  res.json({
    logs,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Quick Update Product Stock
// @route   PATCH /api/admin/products/:id/stock
// @access  Admin
export const updateProductStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || Number(stock) < 0) {
    throw new AppError("Invalid stock value", 400);
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const oldStock = product.stock;
  product.stock = Number(stock);
  await product.save();

  await logActivity({
    userId: req.user.id,
    action: "UPDATE_STOCK",
    details: `Updated stock for '${product.name}' from ${oldStock} to ${stock}`,
    entityType: "Product",
    entityId: product._id,
    req,
  });

  res.json(product);
});

// @desc    Bulk Import Products
// @route   POST /api/admin/products/import
// @access  Admin
export const bulkImportProducts = asyncHandler(async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    throw new AppError("Invalid or empty products list", 400);
  }

  const imported = [];
  for (const item of products) {
    if (!item.name || !item.price || !item.category) continue;
    const newProduct = await Product.create({
      name: item.name,
      description: item.description || item.name,
      price: Number(item.price) || 0,
      category: item.category,
      stock: Number(item.stock) || 0,
      images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
    });
    imported.push(newProduct);
  }

  await logActivity({
    userId: req.user.id,
    action: "BULK_IMPORT_PRODUCTS",
    details: `Bulk imported ${imported.length} products`,
    entityType: "Product",
    req,
  });

  res.status(201).json({ message: `Successfully imported ${imported.length} products`, count: imported.length });
});

// @desc    Get Categories
// @route   GET /api/admin/categories
// @access  Admin/Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  
  // Aggregate product counts per category
  const productCounts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  const countMap = {};
  productCounts.forEach(c => { countMap[c._id] = c.count; });

  const categoriesWithCount = categories.map(cat => ({
    ...cat.toObject(),
    productCount: countMap[cat.name] || 0
  }));

  res.json(categoriesWithCount);
});

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image } = req.body;
  if (!name) {
    throw new AppError("Category name is required", 400);
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    throw new AppError("Category with this name already exists", 400);
  }

  const category = await Category.create({
    name,
    slug,
    description: description || "",
    icon: icon || "tag",
    image: image || "",
  });

  await logActivity({
    userId: req.user.id,
    action: "CREATE_CATEGORY",
    details: `Created category '${name}'`,
    entityType: "Category",
    entityId: category._id,
    req,
  });

  res.status(201).json(category);
});

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
// @access  Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image, isActive } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (name && name !== category.name) {
    category.name = name;
    category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  await logActivity({
    userId: req.user.id,
    action: "UPDATE_CATEGORY",
    details: `Updated category '${category.name}'`,
    entityType: "Category",
    entityId: category._id,
    req,
  });

  res.json(category);
});

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await category.deleteOne();

  await logActivity({
    userId: req.user.id,
    action: "DELETE_CATEGORY",
    details: `Deleted category '${category.name}'`,
    entityType: "Category",
    entityId: category._id,
    req,
  });

  res.json({ message: "Category deleted successfully" });
});
