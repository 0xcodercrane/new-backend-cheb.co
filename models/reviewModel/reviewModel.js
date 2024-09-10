import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reviewSchema = Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SellerStore",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: [true, "Please Add Rating"],
    },
    message: {
      type: String,
      required: [true, "Please Add Comment"],
    },
    image: {
      type: String,
      // required: [true, "Please Add Image"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Review", reviewSchema);
