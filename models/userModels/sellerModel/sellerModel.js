import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    type: {
      type: String,
      required: [true, "Please Add a type"],
      enum: ["Sneaker Store", "Independent Reseller"],
    },
    phoneNumber: {
      type: String,
    },
    dp: {
      type: String,
    },
    sellerAliasId :{
      type: String,
      required: true,
    },
    walletAddress:{
      type: String,
      lowercase: true,
      require:false
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Seller", sellerSchema);
