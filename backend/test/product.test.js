import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

describe("Product API", () => {
  let adminToken, userToken;

  beforeEach(async () => {
    // Create Admin
    const adminRes = await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
    });
    // Manually promote to admin (assuming DB is available)
    await User.updateOne({ email: "admin@example.com" }, { role: 1 });
    // Re-login to get admin token with correct role payload
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    adminToken = adminLogin.body.accessToken;

    // Create User
    const userRes = await request(app).post("/api/auth/register").send({
      name: "Normal User",
      email: "user@example.com",
      password: "password123",
    });
    userToken = userRes.body.accessToken;
  });

  it("should create a product (Admin)", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Product",
        description: "Description",
        price: 100,
        category: "Electronics",
        stock: 10,
        images: ["img.jpg"],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test Product");
  });

  it("should not create a product (User)", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Test Product 2",
        price: 100,
      });
    expect(res.statusCode).toBe(403);
  });

  it("should get all products", async () => {
    // Create a product first
    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Product 3",
        description: "Desc",
        price: 50,
        category: "Books",
        stock: 5,
        images: ["img.jpg"],
      });

    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body).toMatchObject({ page: 1, pages: 1, total: 1 });
  });

  it("should paginate, search, filter, and sort products", async () => {
    await Product.insertMany([
      {
        name: "Wireless Keyboard A",
        description: "Compact keyboard",
        price: 900,
        category: "Electronics",
        stock: 8,
      },
      {
        name: "Wireless Keyboard B",
        description: "Ergonomic keyboard",
        price: 700,
        category: "Electronics",
        stock: 5,
      },
      {
        name: "Wireless Mouse",
        description: "Optical device",
        price: 300,
        category: "Accessories",
        stock: 6,
      },
    ]);

    const res = await request(app).get(
      "/api/products?q=keyboard&category=Electronics&sort=price_asc&page=1&limit=1",
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ page: 1, pages: 2, total: 2 });
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe("Wireless Keyboard B");
  });

  it("should reject invalid product listing options", async () => {
    const res = await request(app).get("/api/products?page=0&limit=1000");

    expect(res.statusCode).toBe(400);
  });

  it("should update product stock (Admin)", async () => {
    const product = await Product.create({
      name: "Stock Product",
      description: "Description",
      price: 100,
      category: "Electronics",
      stock: 5,
    });

    const res = await request(app)
      .put(`/api/products/${product.id}/stock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stock: 12 });

    expect(res.statusCode).toBe(200);
    expect(res.body.stock).toBe(12);
  });
});
