import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

describe("Cart API", () => {
  let userToken, productId;

  beforeEach(async () => {
    // 1. Create User
    const userRes = await request(app).post("/api/auth/register").send({
      name: "Cart User",
      email: "cart@example.com",
      password: "password123",
    });
    userToken = userRes.body.accessToken;

    // 2. Create Product
    const product = await Product.create({
      name: "Cart Product",
      description: "Desc",
      price: 10,
      category: "Misc",
      stock: 100,
      isActive: true,
    });
    productId = product._id;
  });

  it("should add item to cart", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].product._id).toBe(productId.toString());
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.totalPrice).toBe(20);
  });

  it("should update item quantity", async () => {
    await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    const res = await request(app)
      .put(`/api/cart/update/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
    expect(res.body.totalPrice).toBe(50);
  });

  it("should remove item from cart", async () => {
    await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    const res = await request(app)
      .delete(`/api/cart/remove/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(0);
    expect(res.body.totalPrice).toBe(0);
  });

  it("should reject invalid cart quantities", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid request/);
  });

  it("should return ETB subtotal, shipping, VAT, and total", async () => {
    await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      subtotal: 20,
      shippingFee: 100,
      vat: 3,
      totalAmount: 123,
      currency: "ETB",
    });
  });
});
