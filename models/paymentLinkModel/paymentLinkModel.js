import mongoose from "mongoose";

const paymentAccountSchema = new mongoose.Schema(
    {
        accountId: {
            type: String,
            required: false,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: false,
        },
        email : {
            type: String,
            required: false,
        },
        url : {
            type: String,
            required: false,
        },
        status: {
            type: String,
            default: "COMPLETED",
        },
    },
    { timestamps: true }
);

const PaymentAccountLinkModel = mongoose.model("PaymentAccountLink", paymentAccountSchema);
export default PaymentAccountLinkModel;