import { MongoMemoryServer } from "mongodb-memory-server";
import Link from "mongoose"; // Just to be consistent? No.
import mongoose from "mongoose";
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
