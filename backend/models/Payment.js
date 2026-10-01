//Payment model
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["ETB"], default: "ETB", required: true },
    method: { type: String },
    provider: { type: String, enum: ["chapa", "cod"], required: true },
    txRef: { type: String, required: true, unique: true, index: true },
    providerRef: { type: String },
    rawPayload: { type: mongoose.Schema.Types.Mixed },
    processingAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      required: true,
      default: "Pending",
    },
  },
  { timestamps: { createdAt: "createdAt" } },
);

paymentSchema.index({ status: 1, createdAt: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
