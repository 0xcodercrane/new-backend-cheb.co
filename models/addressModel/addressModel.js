import mongoose from "mongoose";
const { Schema, model } = mongoose;

const addressSchema = Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    type: {
        type: String,
        required: true,
        enum: ['home', 'office', 'other']
    },
    state: {
      type: String,
      required: [true, "Please Add a state"],
    },
    city: {
      type: String,
      required: [true, "Please Add a city"],
    },
    street: {
      type: String,
      required: [true, "Please Add a street"],
    },
    // precedence: {
    //   type: Number,
    //   required: true,
    // },
    zipCode: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Address", addressSchema);
