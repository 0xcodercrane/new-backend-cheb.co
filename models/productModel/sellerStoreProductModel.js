import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerStoreProduct = Schema(
  {
    sellerStore: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SellerStore",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    type: {
      type: String,
      enum: ["sneaker", "apparel"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("SellerStoreProduct", sellerStoreProduct);
