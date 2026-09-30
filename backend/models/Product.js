//Product model
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
