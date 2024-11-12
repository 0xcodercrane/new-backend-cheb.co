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
      enum: ["Sneaker Store", "Independent Reseller","Local Fashion Brand","Other"],
    },
    phoneNumber: {
      type: String,
    },
    bussinessName: {
      type: String,
    },
    bussinessAddress: {
      type: String,
    },
    websiteUrl: {
      type: String,
    },
    socialMediaLink: {
      type: String,
    },
    otherType: {
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
    isArchive:{
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Seller", sellerSchema);
