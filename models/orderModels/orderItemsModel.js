import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderItemSchema = Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    item: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    storeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "SellerStore",
    },
    size: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "SellerStoreProductSize",
    },
    // color: {
    //     type: Schema.Types.ObjectId,
    //     required: true,
    //     ref: 'Color'
    // },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must have a minimum value of 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [1, "Price must have a minimum value of 1"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Price Amounts must have a minimum value of 0"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("OrderItem", orderItemSchema);
