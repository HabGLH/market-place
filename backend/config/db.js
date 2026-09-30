// Data base conection
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, {
      cause: error,
    });
  }
};

export default connectDB;
