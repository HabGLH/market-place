import "dotenv/config"; // Must be first to load env vars before other imports
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorMiddleware.js";
import requestLogger from "./middleware/requestLogger.js";

if (process.env.NODE_ENV !== "test") {
  connectDB(); // Connect to the database
}

const app = express();
app.set("trust proxy", 1);

// Middleware
app.use(helmet());
app.use(requestLogger); // Log requests early
app.use(express.json());
app.use(cookieParser());
app.use(cors());

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
// Start the server only if run directly and not in test
// if (
//   process.argv[1] === new URL(import.meta.url).pathname &&
//   process.env.NODE_ENV !== "test"
// ) {
// }

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
