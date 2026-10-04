import { validateEnv } from "../config/env.js";

const validEnv = {
  MONGO_URL: "mongodb://127.0.0.1:27017/marketplace",
  ACCESS_TOKEN_SECRET: "test-secret",
  CLIENT_URL: "http://localhost:5173",
  CHAPA_SECRET_KEY: "test-chapa-secret",
  CHAPA_WEBHOOK_SECRET: "test-webhook-secret",
  SHIPPING_FEE_ETB: "100",
  FREE_SHIPPING_THRESHOLD_ETB: "5000",
};

describe("environment validation", () => {
  it("accepts all required environment variables", () => {
    expect(() => validateEnv(validEnv)).not.toThrow();
  });

  it("reports missing required variables", () => {
    expect(() => validateEnv({ ...validEnv, CHAPA_SECRET_KEY: " " })).toThrow(
      "Missing required environment variables: CHAPA_SECRET_KEY",
    );
  });

  it("requires all Cloudinary credentials when any are configured", () => {
    expect(() =>
      validateEnv({ ...validEnv, CLOUDINARY_CLOUD_NAME: "cloud" }),
    ).toThrow(
      "Cloudinary configuration requires all of: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
    expect(() =>
      validateEnv({
        ...validEnv,
        CLOUDINARY_CLOUD_NAME: "cloud",
        CLOUDINARY_API_KEY: "key",
        CLOUDINARY_API_SECRET: "secret",
      }),
    ).not.toThrow();
  });

  it("rejects invalid connection and client URLs", () => {
    expect(() => validateEnv({ ...validEnv, MONGO_URL: "localhost" })).toThrow(
      "MONGO_URL must be a valid MongoDB connection URL",
    );
    expect(() => validateEnv({ ...validEnv, CLIENT_URL: "not-a-url" })).toThrow(
      "CLIENT_URL must be a valid URL",
    );
  });
});
