import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

describe("Admin Dashboard API", () => {
  let adminToken;

  beforeEach(async () => {
    // Create Admin
    const adminRes = await request(app).post("/api/auth/register").send({
      name: "Habtamu Genet",
      email: "admin@test.com",
      password: "123456",
    });
    await User.updateOne({ email: "admin@test.com" }, { role: 1 });
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "123456",
    });
    adminToken = adminLogin.body.accessToken;

    // Seed Data
    await User.create({
      name: "User 1",
      email: "u1@example.com",
      password: "p",
    });
    await Product.create({
      name: "P1",
      description: "Test product 1",
      category: "Test",
      price: 10,
      stock: 2,
      isActive: true,
    }); // Low stock
    await Product.create({
      name: "P2",
      description: "Test product 2",
      category: "Test",
      price: 20,
      stock: 50,
      isActive: true,
    });
    await Order.create({
      userId: adminRes.body.user.id,
      totalAmount: 100,
      paymentMethod: "Cash",
      products: [],
    });
  });

  it("should return dashboard stats", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(2); // Admin + User
    expect(res.body.totalProducts).toBe(2);
    expect(res.body.totalOrders).toBe(1);
    expect(res.body.totalRevenue).toBe(100);
    expect(res.body.lowStockProducts).toHaveLength(1);
    expect(res.body.lowStockProducts[0].name).toBe("P1");
  });
});
