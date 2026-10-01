import { createHmac } from "node:crypto";
import { jest } from "@jest/globals";
import request from "supertest";
import app from "../server.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import { runPaymentExpiryCheck } from "../services/payments/paymentExpiryJob.js";

describe("Payment API", () => {
  const shippingAddress = {
    fullName: "Payment User",
    phone: "+251911123456",
    city: "Addis Ababa",
    subCity: "Bole",
    addressLine: "Bole Road, House 12",
    landmark: "Near the airport",
  };
  const testWebhookSecret = "test-webhook-secret";
  const chapaResponse = (payload) => ({
    ok: true,
    json: async () => payload,
  });

  let userToken;
  let userId;
  let productId;
  let originalFetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    const userRes = await request(app).post("/api/auth/register").send({
      name: "Payment User",
      email: "payment@example.com",
      password: "password123",
      phone: shippingAddress.phone,
    });
    userToken = userRes.body.accessToken;
    userId = userRes.body.user.id;

    const product = await Product.create({
      name: "Payment Product",
      description: "Test product",
      price: 50,
      category: "Electronics",
      stock: 10,
    });
    productId = product.id;
    await Cart.create({ userId, items: [{ product: productId, quantity: 2 }] });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const initializeCheckout = async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      chapaResponse({
        status: "success",
        data: { checkout_url: "https://checkout.chapa.co/test" },
      }),
    );

    return request(app)
      .post("/api/payments/checkout")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "chapa", shippingAddress });
  };

  const sendWebhook = (txRef, signature) => {
    const rawBody = JSON.stringify({ event: "charge.success", tx_ref: txRef });
    const validSignature = createHmac("sha256", testWebhookSecret)
      .update(rawBody)
      .digest("hex");

    return request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("x-chapa-signature", signature ?? validSignature)
      .send(rawBody);
  };

  const mockSuccessfulVerification = (txRef) => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      chapaResponse({
        status: "success",
        data: {
          status: "success",
          tx_ref: txRef,
          amount: "215.00",
          currency: "ETB",
          reference: "CHAPA-REFERENCE-1",
        },
      }),
    );
  };

  it("should create a server-priced Chapa checkout", async () => {
    const res = await initializeCheckout();

    expect(res.statusCode).toBe(201);
    expect(res.body.checkoutUrl).toBe("https://checkout.chapa.co/test");
    const order = await Order.findById(res.body.orderId);
    expect(order).toMatchObject({
      subtotal: 100,
      shippingFee: 100,
      vat: 15,
      totalAmount: 215,
      currency: "ETB",
      paymentStatus: "Pending",
      paymentMethod: "chapa",
    });
    expect(order.txRef).toBe(res.body.txRef);
    expect(await Payment.findOne({ txRef: res.body.txRef })).toMatchObject({
      status: "Pending",
      provider: "chapa",
      amount: 215,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.chapa.co/v1/transaction/initialize",
      expect.objectContaining({ method: "POST" }),
    );
    const initializePayload = JSON.parse(
      globalThis.fetch.mock.calls[0][1].body,
    );
    expect(initializePayload).toMatchObject({
      amount: "215.00",
      currency: "ETB",
      phone_number: "0911123456",
      tx_ref: order.txRef,
      return_url: `http://localhost:5173/payment/return?txRef=${order.txRef}`,
    });
    expect((await Cart.findOne({ userId })).items).toHaveLength(1);
  });

  it("should reject an invalid webhook signature without verifying transaction", async () => {
    const checkout = await initializeCheckout();
    globalThis.fetch = jest.fn();

    const res = await sendWebhook(checkout.body.txRef, "f".repeat(64));

    expect(res.statusCode).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("should accept Chapa's canonical JSON payload signature", async () => {
    const checkout = await initializeCheckout();
    const payload = { event: "charge.success", tx_ref: checkout.body.txRef };
    const canonicalSignature = createHmac("sha256", testWebhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        chapaResponse({ status: "success", data: { status: "pending" } }),
      );

    const rawBody = JSON.stringify(payload, null, 2);
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("x-chapa-signature", canonicalSignature)
      .send(rawBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.received).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("should verify payment, decrement stock, and clear the cart", async () => {
    const checkout = await initializeCheckout();
    mockSuccessfulVerification(checkout.body.txRef);

    const res = await sendWebhook(checkout.body.txRef);

    expect(res.statusCode).toBe(200);
    expect(res.body.received).toBe(true);
    expect((await Order.findById(checkout.body.orderId)).paymentStatus).toBe(
      "Paid",
    );
    expect((await Payment.findOne({ txRef: checkout.body.txRef })).status).toBe(
      "Success",
    );
    expect((await Product.findById(productId)).stock).toBe(8);
    expect((await Cart.findOne({ userId })).items).toHaveLength(0);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `https://api.chapa.co/v1/transaction/verify/${checkout.body.txRef}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
      }),
    );
  });

  it("should ignore duplicate successful webhooks without decrementing stock twice", async () => {
    const checkout = await initializeCheckout();
    mockSuccessfulVerification(checkout.body.txRef);
    await sendWebhook(checkout.body.txRef);

    const res = await sendWebhook(checkout.body.txRef);

    expect(res.statusCode).toBe(200);
    expect(res.body.received).toBe(true);
    expect((await Product.findById(productId)).stock).toBe(8);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("should fail payment without clearing cart if stock is unavailable at verification", async () => {
    const checkout = await initializeCheckout();
    await Product.updateOne({ _id: productId }, { stock: 0 });
    mockSuccessfulVerification(checkout.body.txRef);

    const res = await sendWebhook(checkout.body.txRef);

    expect(res.statusCode).toBe(200);
    expect(res.body.received).toBe(true);
    expect((await Order.findById(checkout.body.orderId)).paymentStatus).toBe(
      "Failed",
    );
    expect((await Cart.findOne({ userId })).items).toHaveLength(1);
    expect((await Product.findById(productId)).stock).toBe(0);
  });

  it("should reject a successful verification with a mismatched amount", async () => {
    const checkout = await initializeCheckout();
    globalThis.fetch = jest.fn().mockResolvedValue(
      chapaResponse({
        status: "success",
        data: {
          status: "success",
          tx_ref: checkout.body.txRef,
          amount: "1.00",
          currency: "ETB",
        },
      }),
    );

    const res = await sendWebhook(checkout.body.txRef);

    expect(res.statusCode).toBe(200);
    expect((await Order.findById(checkout.body.orderId)).paymentStatus).toBe(
      "Failed",
    );
    expect((await Product.findById(productId)).stock).toBe(10);
    expect((await Cart.findOne({ userId })).items).toHaveLength(1);
  });

  it("should create a COD order, decrease stock, and clear the cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "cod", shippingAddress });

    expect(res.statusCode).toBe(201);
    expect(res.body.paymentMethod).toBe("cod");
    expect(res.body.paymentStatus).toBe("Pending");
    expect((await Product.findById(productId)).stock).toBe(8);
    expect((await Cart.findOne({ userId })).items).toHaveLength(0);
  });

  it("should reject a COD order when the cart exceeds available stock", async () => {
    await Product.updateOne({ _id: productId }, { stock: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ paymentMethod: "cod", shippingAddress });

    expect(res.statusCode).toBe(409);
    expect((await Product.findById(productId)).stock).toBe(1);
    expect((await Cart.findOne({ userId })).items).toHaveLength(1);
    expect(await Payment.countDocuments()).toBe(0);
  });

  it("should only return payment status to the owning user", async () => {
    const checkout = await initializeCheckout();
    const other = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: "another-payment@example.com",
      password: "password123",
    });

    const res = await request(app)
      .get(`/api/payments/status/${checkout.body.txRef}`)
      .set("Authorization", `Bearer ${other.body.accessToken}`);

    expect(res.statusCode).toBe(404);
  });

  it("should verify and expire a pending payment older than 24 hours", async () => {
    const checkout = await initializeCheckout();
    const createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await Payment.collection.updateOne(
      { txRef: checkout.body.txRef },
      { $set: { createdAt } },
    );
    globalThis.fetch = jest.fn().mockResolvedValue(
      chapaResponse({
        status: "success",
        data: {
          status: "pending",
          tx_ref: checkout.body.txRef,
          amount: "215.00",
          currency: "ETB",
        },
      }),
    );

    await runPaymentExpiryCheck({
      verify: (txRef) => {
        expect(txRef).toBe(checkout.body.txRef);
        return globalThis.fetch();
      },
    });

    expect((await Payment.findOne({ txRef: checkout.body.txRef })).status).toBe(
      "Failed",
    );
    expect((await Order.findById(checkout.body.orderId)).paymentStatus).toBe(
      "Failed",
    );
    expect((await Cart.findOne({ userId })).items).toHaveLength(1);
  });
});
