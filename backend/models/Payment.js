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
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      required: true,
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
