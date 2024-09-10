import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerStoreSchema = Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    name: {
      type: String,
      required: [true, "Please add a store name"],
    },
    slug: {
      type: String,
      required: [true, "Please Add Slug"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
    },
    mobile: {
      type: String,
      // minLength: [11, 'Mobile Number must be exactly 11 digits long'],
      // maxLength: [11, 'Mobile Number must be exactly 11 digits long']
    },

    city: {
      type: String,
      // required: [true, 'Please add a store name']
    },
    state: {
      type: String,
      // required: [true, 'Please add a store name']
    },
    zipCode: {
      type: String,
      // required: [true, 'Please add a store name']
    },
    street: {
      type: String,
      // required: [true, 'Please add a store name']
    },
    image: {
      type: String,
      required: [true, "Please Add Image"],
    },
    bannerImage: {
      type: String,
      required: [true, "Please Add Image"],
    },
    coordinates: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    isArchive: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    permittedToSellApparel: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["Sneaker Store", "Independent Reseller"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("SellerStore", sellerStoreSchema);
