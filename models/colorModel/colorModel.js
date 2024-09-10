import mongoose from "mongoose";
const { Schema, model } = mongoose;

const colorSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please Add Name"],
    },
    precedence: {
      type: Number,
      required: [true, "Please Add Precedence"],
    },
    type: {
      type: String,
      required: [true, "Please Add Type"],
      enum: ["sneaker", "apparel"],
    },
    isArchive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Color", colorSchema);
