import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerCardInfoSchema = Schema(
  {
    seller: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    bankName: {
      type: String,
      required: [true, "Please Add BankName"],
    },
    accountHolderName: {
      type: String,
      required: [true, "Please Add Account Holder Name"],
    },
    bankAddress: {
      type: String,
      required: [true, "Please Add Bank Account"],
    },
    accountNumber: {
      type: Number,
      required: [true, "Please Add Account Number"],
    },
    routingNumber: {
      type: Number,
      required: [true, "Please Add Routing Number"],
    },
    mobile: {
      type: Number,
      required: [true, "Please Add Number"],
    },
    email: {
      type: String,
      required: [true, "Please Add Email"],
    },
    walletAddress: {
      type: String,
    },
    branchName: {
      type: String,
      required: [true, "Please Add Branch Address"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("SellerCardInfo", sellerCardInfoSchema);
