import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please Add Name"],
    },
    slug: {
      type: String,
      required: [true, "Please Add Slug"],
    },
    cardImage: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: [true, "Please Add Sku"],
    },
    // retailCost: {
    //   type: Number,
    // },

    description: {
      type: String,
      required: [true, "Please Add Description"],
    },
    type: {
      type: String,
      enum: ["sneaker", "apparel"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("ProductFromAdmin", productSchema);
