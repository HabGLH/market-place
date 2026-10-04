import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";

describe("Order API", () => {
  const shippingAddress = {
    fullName: "Order User",
    phone: "+251911123456",
    city: "Addis Ababa",
    subCity: "Bole",
    addressLine: "Bole Road, House 12",
    landmark: "Near the airport",
  };
  console.log("Registered Models in Order Test:", mongoose.modelNames());
  let userToken, adminToken, userId;
  let productId;

  beforeEach(async () => {
    // 1. Create User
    const userRes = await request(app).post("/api/auth/register").send({
      name: "Order User",
      email: "order@example.com",
      password: "password123",
    });
    userToken = userRes.body.accessToken;
    userId = userRes.body.user.id;

    // 2. Create Admin
    const adminRes = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
    });
    await User.updateOne({ email: "admin@example.com" }, { role: 1 });
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    adminToken = adminLogin.body.accessToken;

    // 3. Create Product
    const product = await Product.create({
      name: "Order Product",
      description: "Desc",
      price: 50,
      category: "Test Category",
      stock: 10,
      isActive: true,
    });
    productId = product._id;

    // Setup Cart
    await Cart.create({
      userId: userId,
      items: [{ product: productId, quantity: 2 }],
    });
  });

  it("should create an order from cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "cod", shippingAddress, totalAmount: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body.totalAmount).toBe(215);
    expect(res.body).toMatchObject({
      subtotal: 100,
      shippingFee: 100,
      vat: 15,
      currency: "ETB",
      paymentStatus: "Pending",
      orderStatus: "Processing",
      paymentMethod: "cod",
    });
    const updatedProduct = await Product.findById(productId);
    expect(updatedProduct.stock).toBe(8);
  });

  it("should get user orders", async () => {
    // Create order first
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "cod", shippingAddress });

    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].products[0].productId).toMatchObject({
      name: "Order Product",
      images: [],
    });
  });

  it("should allow admin to get all orders", async () => {
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "cod", shippingAddress });

    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should reject an invalid order status", async () => {
    const res = await request(app)
      .put("/api/orders/507f1f77bcf86cd799439011/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Paid" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid request/);
  });

  it("should restore COD stock when an unpaid order is cancelled", async () => {
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "cod", shippingAddress });

    const res = await request(app)
      .put(`/api/orders/${created.body._id}/cancel`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect((await Product.findById(productId)).stock).toBe(10);
  });
});
