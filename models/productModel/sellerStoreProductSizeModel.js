import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerStoreProductSize = new Schema(
  {
    sellerStoreProduct: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SellerStoreProduct",
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Size",
    },
    gender: {
      type: String,
      enum: ["men", "women"],
    },
    productCondition: {
      type: String,
      enum: ["New", "Pre-owned"],
    },
    retailCost: {
      type: Number,
    },
    stock: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default model("SellerStoreProductSize", sellerStoreProductSize);
