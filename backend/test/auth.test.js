import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";

describe("Auth API", () => {
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("should not register user with existing email", async () => {
    await User.create(userData);
    const res = await request(app).post("/api/auth/register").send(userData);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should reject invalid registration payloads", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...userData,
        email: "not-an-email",
        password: "short",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid request/);
  });

  it("should reject phone numbers outside Ethiopian mobile format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...userData, phone: "0911123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid request/);
  });

  it("should login with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should not login with incorrect password", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should reject login for a disabled user", async () => {
    await request(app).post("/api/auth/register").send(userData);
    await User.updateOne({ email: userData.email }, { isActive: false });

    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Account is disabled");
  });

  it("should refresh token with valid cookie", async () => {
    // 1. Register & get cookies
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(userData);
    const cookies = registerRes.headers["set-cookie"];

    // 2. Refresh
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.headers["set-cookie"]).toBeDefined(); // Should rotate keys
  });

  it("should reject refresh for a disabled user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(userData);
    const cookies = registerRes.headers["set-cookie"];
    await User.updateOne({ email: userData.email }, { isActive: false });

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Account is disabled");
  });

  it("should serve root and health routes", async () => {
    expect((await request(app).get("/")).statusCode).toBe(200);
    const health = await request(app).get("/health");
    expect(health.statusCode).toBe(200);
    expect(health.body.status).toBe("OK");
    expect(app.get("trust proxy")).toBe(1);
  });

  it("should allow credentialed CORS only from the configured client", async () => {
    const allowed = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");
    const blocked = await request(app)
      .get("/health")
      .set("Origin", "https://unexpected.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");
    expect(blocked.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(blocked.headers["access-control-allow-origin"]).not.toBe(
      "https://unexpected.example",
    );
  });

  it("should reject JSON payloads larger than 10kb", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(`{"padding":"${"x".repeat(11 * 1024)}"}`);

    expect(res.statusCode).toBe(413);
  });
});
