import mongoose from "mongoose";
const { Schema, model } = mongoose;

const favouriteSchema = Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "SellerStore",
      default: null,
    },
    type: {
      type: String,
      required: [true, "Please Add Type"],
      enum: ["product", "store"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Favourite", favouriteSchema);
