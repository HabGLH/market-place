import "dotenv/config"; // Must be first to load env vars before other imports
import connectDB from "./config/db.js";
import { validateEnv } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorMiddleware.js";
import requestLogger from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";

const app = express();
app.set("trust proxy", 1);
const sanitizeMongoInputs = mongoSanitize();
const express5MongoSanitize = (req, res, next) => {
  Object.defineProperty(req, "query", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: mongoSanitize.sanitize(req.query),
  });
  sanitizeMongoInputs(req, res, next);
};

// Middleware
app.use(helmet());
app.use(requestLogger); // Log requests early
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express5MongoSanitize);
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API in point of tech brand site");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 Handler
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (process.env.NODE_ENV !== "test" && isMainModule) {
  validateEnv();

  let server;
  const shutdown = (signal) => {
    logger.info(`Received ${signal}; shutting down`);
    const closeServer = () => {
      mongoose
        .disconnect()
        .then(() => {
          logger.info("MongoDB disconnected");
        })
        .catch((error) => {
          logger.error(`MongoDB shutdown error: ${error.message}`);
          process.exitCode = 1;
        });
    };

    if (server) {
      server.close(closeServer);
    } else {
      closeServer();
    }
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));

  connectDB()
    .then(() => {
      server = app.listen(PORT, () =>
        logger.info(`Server listening on port ${PORT}`),
      );
    })
    .catch((error) => {
      logger.error(`Server startup failed: ${error.message}`);
      process.exitCode = 1;
    });
}

export default app;
