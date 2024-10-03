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
      require:false,
    },
    accountHolderName: {
      type: String,
      require:false,
    },
    bankAddress: {
      type: String,
      require:false,
    },
    accountNumber: {
      type: Number,
      require:false,
    },
    routingNumber: {
      type: Number,
      require:false,
    },
    mobile: {
      type: Number,
      require:false,
    },
    email: {
      type: String,
      require:false,
    },
    walletAddress: {
      type: String,
      require:false,
    },
    branchName: {
      type: String,
      require:false,
    },

    cardHolderName: {
      type: String,
      require:false,
    },
    cardNumber: {
      type: Number,
      require:false,
    },
    cardExpiryDate: {
      months:String,
      years: String,
      require: false,
    },
    cardCvv: {
      type: Number,
      require:false,
    },
    cardBillingAddress: {
      type: String,
      require:false,
    },
    paymentMethod : {
      type: String,
      require:false
    }
  },
  {
    timestamps: true,
  }
);

export default model("SellerCardInfo", sellerCardInfoSchema);
