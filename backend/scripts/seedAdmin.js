import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const name = (process.env.ADMIN_NAME || "Marketplace Admin").trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

try {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set a valid ADMIN_EMAIL in the backend environment.");
  }
  if (!password || password.length < 8 || password.length > 128) {
    throw new Error(
      "Set ADMIN_PASSWORD to a value between 8 and 128 characters.",
    );
  }
  if (name.length < 2 || name.length > 100) {
    throw new Error("ADMIN_NAME must be between 2 and 100 characters.");
  }

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== 1) {
      existingUser.role = 1;
      await existingUser.save();
    }
    console.log(
      `Admin access is enabled for ${email}. Existing password was kept.`,
    );
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 1,
      status: "active",
    });
    console.log(`Admin account created for ${email}.`);
  }
} catch (error) {
  console.error(`Admin setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
