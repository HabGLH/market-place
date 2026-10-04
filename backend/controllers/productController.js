//productController.js

// Controller for managing products in an e-commerce application
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler"; // Middleware to handle async errors
import AppError from "../utils/AppError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page, limit, q, category, sort: sortOption } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  const searchTerm = q?.trim();
  const searchPattern = searchTerm ? escapeRegex(searchTerm) : null;
  if (searchPattern) {
    filter.$or = [
      { name: { $regex: searchPattern, $options: "i" } },
      { description: { $regex: searchPattern, $options: "i" } },
    ];
  }

  const sort = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
  }[sortOption];

  const productsQuery = searchPattern
    ? Product.aggregate([
        { $match: filter },
        {
          $addFields: {
            searchRank: {
              $switch: {
                branches: [
                  {
                    case: {
                      $regexMatch: {
                        input: "$name",
                        regex: `^${searchPattern}$`,
                        options: "i",
                      },
                    },
                    then: 0,
                  },
                  {
                    case: {
                      $regexMatch: {
                        input: "$name",
                        regex: `^${searchPattern}`,
                        options: "i",
                      },
                    },
                    then: 1,
                  },
                  {
                    case: {
                      $regexMatch: {
                        input: "$name",
                        regex: searchPattern,
                        options: "i",
                      },
                    },
                    then: 2,
                  },
                ],
                default: 3,
              },
            },
          },
        },
        { $sort: { searchRank: 1, ...sort } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { searchRank: 0 } },
      ])
    : Product.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

  const [items, total] = await Promise.all([
    productsQuery,
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && product.isActive) {
    res.json(product);
  } else {
    throw new AppError("Product not found", 404);
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images } = req.body;

  if (price < 0) {
    throw new AppError("Price cannot be negative", 400);
  }
  if (stock < 0) {
    throw new AppError("Stock cannot be negative", 400);
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    stock,
    images,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    if (price < 0) {
      throw new AppError("Price cannot be negative", 400);
    }
    if (stock < 0) {
      throw new AppError("Stock cannot be negative", 400);
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    throw new AppError("Product not found", 404);
  }
});

// @desc    Soft delete a product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isActive = false;
    await product.save();
    res.json({ message: "Product soft deleted" });
  } else {
    throw new AppError("Product not found", 404);
  }
});

// @desc    Update stock quantity
// @route   PUT /api/products/:id/stock
// @access  Admin
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    if (stock < 0) {
      throw new AppError("Stock cannot be negative", 400);
    }

    product.stock = stock;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    throw new AppError("Product not found", 404);
  }
});

// @desc    Get all products (Admin - includes inactive)
// @route   GET /api/products/admin
// @access  Admin}
export const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Enable (restore) a product
// @route   PUT /api/products/:id/enable
// @access  Admin
export const enableProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isActive = true;
    await product.save();
    res.json({ message: "Product enabled" });
  } else {
    throw new AppError("Product not found", 404);
  }
});
