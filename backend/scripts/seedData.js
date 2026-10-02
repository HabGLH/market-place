import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import ActivityLog from "../models/ActivityLog.js";

const seedData = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Sample data seeding is disabled in production.");
    }

    await connectDB();
    console.log("Connected to MongoDB for seeding sample dataset...");

    // 1. Seed Categories
    const categoriesData = [
      { name: "Electronics", slug: "electronics", description: "Gadgets, devices & computer accessories", icon: "laptop", image: "https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=500" },
      { name: "Fashion", slug: "fashion", description: "Clothing, shoes & wearable apparel", icon: "shirt", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500" },
      { name: "Home & Living", slug: "home-living", description: "Decor, furniture & kitchen essentials", icon: "home", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500" },
      { name: "Books & Stationeries", slug: "books", description: "Best-selling novels, journals & supplies", icon: "book", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500" },
      { name: "Fitness & Outdoor", slug: "fitness", description: "Gym gear, sports wear & camping equipment", icon: "sparkles", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500" },
    ];

    for (const cat of categoriesData) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
    }
    console.log("✅ Seeded 5 Categories");

    // 2. Seed Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const usersData = [
      { name: "System Admin", email: "admin@marketplace.com", password: hashedPassword, role: 1, status: "active", isActive: true },
      { name: "Abebe Kebede", email: "abebe@example.com", password: hashedPassword, role: 0, status: "active", isActive: true, phone: "+251911223344" },
      { name: "Sara Yohannes", email: "sara@example.com", password: hashedPassword, role: 0, status: "active", isActive: true, phone: "+251922334455" },
      { name: "Dawit Tadesse", email: "dawit@example.com", password: hashedPassword, role: 0, status: "active", isActive: true, phone: "+251933445566" },
      { name: "Helen Berhanu", email: "helen@example.com", password: hashedPassword, role: 0, status: "inactive", isActive: false, phone: "+251944556677" },
    ];

    const seededUsers = [];
    for (const uData of usersData) {
      const user = await User.findOneAndUpdate({ email: uData.email }, uData, { upsert: true, new: true });
      seededUsers.push(user);
    }
    console.log("✅ Seeded 5 Users (Including Admin: admin@marketplace.com)");

    const adminUser = seededUsers.find((u) => u.role === 1);
    const buyer1 = seededUsers.find((u) => u.email === "abebe@example.com");
    const buyer2 = seededUsers.find((u) => u.email === "sara@example.com");

    // 3. Seed Products
    const productsData = [
      {
        name: "Noise-Cancelling Wireless Headphones",
        description: "Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
        price: 2490,
        category: "Electronics",
        stock: 18,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
        rating: 4.8,
      },
      {
        name: "Ergonomic Mechanical Keyboard",
        description: "Tactile RGB gaming & typing mechanical keyboard with hot-swappable switches.",
        price: 1190,
        category: "Electronics",
        stock: 3, // Low stock
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
        rating: 4.6,
      },
      {
        name: "Ultra-HD 4K Smart Monitor 27\"",
        description: "Stunning IPS display with HDR400, USB-C 65W charging, and ultra-thin bezels.",
        price: 4290,
        category: "Electronics",
        stock: 0, // Out of stock
        images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"],
        rating: 4.9,
      },
      {
        name: "Minimalist Leather Backpack",
        description: "Water-resistant genuine leather travel backpack with 15.6 inch laptop sleeve.",
        price: 890,
        category: "Fashion",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
        rating: 4.7,
      },
      {
        name: "Classic Denim Jacket",
        description: "Timeless vintage denim jacket with durable double stitching and comfortable relaxed fit.",
        price: 650,
        category: "Fashion",
        stock: 2, // Low stock
        images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600"],
        rating: 4.4,
      },
      {
        name: "Ceramic Minimalist Desk Lamp",
        description: "Warm LED dimmable desk lamp with touch control and integrated wireless phone charger.",
        price: 450,
        category: "Home & Living",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"],
        rating: 4.5,
      },
      {
        name: "Aroma Essential Oil Diffuser",
        description: "Ultrasonic 500ml aroma humidifier with 7 color ambient LED lights.",
        price: 320,
        category: "Home & Living",
        stock: 0, // Out of stock
        images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"],
        rating: 4.3,
      },
      {
        name: "Hardcover Productivity Journal",
        description: "Undated daily planner, goal setting tracker, and premium thick bleed-proof pages.",
        price: 240,
        category: "Books & Stationeries",
        stock: 45,
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"],
        rating: 4.9,
      },
    ];

    const seededProducts = [];
    for (const pData of productsData) {
      const prod = await Product.findOneAndUpdate({ name: pData.name }, pData, { upsert: true, new: true });
      seededProducts.push(prod);
    }
    console.log("✅ Seeded 8 Products (with Low Stock & Out of Stock sample items)");

    // 4. Seed Orders spanning last 6 months
    const orderStatuses = ["Delivered", "Shipped", "Processing", "Pending"];
    const now = new Date();

    const ordersToCreate = [];
    for (let i = 0; i < 15; i++) {
      const monthsAgo = Math.floor(Math.random() * 5); // 0 to 4 months ago
      const orderDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 25) + 1);

      const randomProd = seededProducts[i % seededProducts.length];
      const randomUser = i % 2 === 0 ? buyer1 : buyer2;
      const quantity = Math.floor(Math.random() * 2) + 1;
      const subtotal = randomProd.price * quantity;
      const shippingFee = 100;
      const vat = Math.round(subtotal * 0.15);
      const totalAmount = subtotal + shippingFee + vat;
      const status = orderStatuses[i % orderStatuses.length];

      ordersToCreate.push({
        userId: randomUser._id,
        products: [
          {
            productId: randomProd._id,
            quantity,
            price: randomProd.price,
            totalPrice: subtotal,
          },
        ],
        subtotal,
        shippingFee,
        vat,
        totalAmount,
        currency: "ETB",
        paymentMethod: "chapa",
        paymentStatus: status === "Delivered" ? "Paid" : "Pending",
        orderStatus: status,
        txRef: `TX-SAMPLE-${Date.now()}-${i}`,
        shippingAddress: {
          fullName: randomUser.name,
          phone: randomUser.phone || "+251911223344",
          city: "Addis Ababa",
          subCity: "Bole",
          addressLine: "House #123, Street 45",
        },
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    await Order.deleteMany({});
    await Order.insertMany(ordersToCreate);
    console.log("✅ Seeded 15 Historical Orders for Sales Analytics");

    // 5. Seed Activity Logs
    const sampleLogs = [
      { userId: adminUser._id, action: "CREATE_CATEGORY", details: "Created category 'Electronics'", entityType: "Category", createdAt: new Date(Date.now() - 3600000 * 24) },
      { userId: adminUser._id, action: "UPDATE_STOCK", details: "Updated stock for 'Ergonomic Mechanical Keyboard' to 3", entityType: "Product", createdAt: new Date(Date.now() - 3600000 * 12) },
      { userId: adminUser._id, action: "DISABLE_USER", details: "Disabled user 'helen@example.com'", entityType: "User", createdAt: new Date(Date.now() - 3600000 * 4) },
      { userId: adminUser._id, action: "BULK_IMPORT_PRODUCTS", details: "Bulk imported 8 products", entityType: "Product", createdAt: new Date(Date.now() - 3600000 * 1) },
    ];

    await ActivityLog.deleteMany({});
    await ActivityLog.insertMany(sampleLogs);
    console.log("✅ Seeded Sample System Activity Logs");

    console.log("\n🎉 TEST DATA SEEDING COMPLETE!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
