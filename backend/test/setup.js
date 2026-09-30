import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.MONGO_URL ||= "mongodb://127.0.0.1:27017/marketplace-test";
process.env.ACCESS_TOKEN_SECRET ||=
  "test-access-token-secret-with-adequate-length";
process.env.CLIENT_URL ||= "http://localhost:5173";
process.env.CHAPA_SECRET_KEY ||= "test-chapa-secret";
process.env.CHAPA_WEBHOOK_SECRET ||= "test-webhook-secret";

// Force model registration
import "../models/User.js";
import "../models/Product.js";
import "../models/Cart.js";
import "../models/Order.js";
import "../models/RefreshToken.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
