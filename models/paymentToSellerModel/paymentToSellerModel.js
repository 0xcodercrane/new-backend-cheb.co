import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentToSellerSchema = Schema(
  {
    dateOfPayment: {
      type: Date,
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Price Amounts must have a minimum value of 0"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: "Seller",
    },
    dateOfApproval: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model("PaymentToSeller", paymentToSellerSchema);
