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
    product_AliasId:{
      type: String,
      required:false,
    },
    category:{
      type: String,
      require:false,
    },
    // retailCost: {
    //   type: Number,
    //   // required: [true, 'Please Add retailCost']
    // },

    description: {
      type: String,
      // required: [true, "Please Add Description"],
    },
    colorWay: [
      {
        type: String,
        required: [true, "Please Add Colorway"],
      },
    ],
    type: {
      type: String,
      required: [true, "Please Add Product Type"],
      enum: ["sneaker", "apparel"],
    },
    isArchive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Product", productSchema);
