import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productRequestSchema = Schema(
  {
    description: {
      type: String,
      required: [true, "Please Add Name"],
    },
    isPosted :{
        type: Boolean,
        default: false,
    },
    requestedBy:{
        type: Schema.Types.ObjectId,
        ref: "Seller",
    }
  },
  {
    timestamps: true,
  }
);

export default model("ProductRequest", productRequestSchema);
