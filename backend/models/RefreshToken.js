// RefreshToken model must have:, userId, token (hashed), expiresAt, revokedAt
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    // The token that replaced this one (for rotation tracking)
    replacedByToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // MongoDB TTL: deletes document 0 seconds after this date
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedByIp: {
      type: String,
    },
    reason: {
      type: String,
    },
    createdByIp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
