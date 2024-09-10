import mongoose from "mongoose";
const { Schema, model } = mongoose;

const boughTogetherSchema = Schema(
  {
    primaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    secondaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default model("BoughTogether", boughTogetherSchema);
