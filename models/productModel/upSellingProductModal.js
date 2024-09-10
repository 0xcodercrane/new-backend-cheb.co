import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerRecommendationSchema = Schema(
  {
    sellerStoreProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerStoreProduct",
    },
    recommendedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

export default model("SellerRecommendation", sellerRecommendationSchema);
