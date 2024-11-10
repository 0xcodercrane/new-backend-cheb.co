import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentRecivedSchema = Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    seller: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    store: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "SellerStore",
    },
    transactionId: {
      type: String,
      required: false,
    },

    transactionHash :{
      type: String,
      required: false,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Price Amounts must have a minimum value of 0"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("PaymentRecieved", paymentRecivedSchema);
