
import asyncHandler from "express-async-handler";
import PaymentToSeller from "#models/paymentToSellerModel/paymentToSellerModel.js"
import { StatusCodes } from "http-status-codes";
import SellerModel from "#models/userModels/sellerModel/sellerModel.js";
import { ResponseMessage } from '../utils/ResponseMessage.js';
import qs from 'qs';
import PaymentAccountLinkModel from "#models/paymentLinkModel/paymentLinkModel.js";
import stripe from 'stripe';
import axios from "axios";

const stripeInstance = stripe('sk_test_51PRAwuBY5VOE3pmxe6shSx1OUU3WiTLudojkBgh2k2bIii9kx27QLx255vsDjO0gURPmSlK6KKEIjCPE0niQShiM009AfpfH9y'); //vishal sir
const apiKey = 'sk_test_51PRAwuBY5VOE3pmxe6shSx1OUU3WiTLudojkBgh2k2bIii9kx27QLx255vsDjO0gURPmSlK6KKEIjCPE0niQShiM009AfpfH9y';
const encodedApiKey = Buffer.from(apiKey).toString('base64');




const addPaymentToSeller = asyncHandler(async (req, res) => {
    const { dateOfPayment, seller, amount } = req.body;
    if (!dateOfPayment || !seller || !amount) {
        res.status(400);
        throw new Error("Please add all field")
    }
    const paymentToSeller = await PaymentToSeller.create({
        dateOfPayment,
        seller,
        amount,
        createdBy: req.employee._id,
    });

    res.status(200).json(paymentToSeller)
})


const getAllPaymentToSeller = asyncHandler(async (req, res) => {
    const allPaymentToSeller = await PaymentToSeller.find()
        .populate("seller")
        .populate("createdBy");
    res.status(200).json(allPaymentToSeller)
})


const getSinglePaymentToSeller = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sinlgePaymentToSeler = await PaymentToSeller.findById(id);
    res.status(200).json(sinlgePaymentToSeler)
})

const totalPaymentToSeller = asyncHandler(async (req, res) => {
    PaymentToSeller.aggregate([
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ])
        .exec((err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error occurred while calculating total amount");
                return;
            }
            const roundedTotalAmount = Math.round(result[0].totalAmount); // Round the totalAmount
            res.json({ totalAmount: roundedTotalAmount });
        });
});

const getAllsinglePaymentToSeller = asyncHandler(async (req, res) => {
    const id = req.seller._id;
    const paymentToSeller = await PaymentToSeller.find(id).populate("seller")
    const paymentApprovalCount = await PaymentToSeller.countDocuments({ seller: id, isApprove: false })
    res.status(200).json({ paymentToSeller, paymentApprovalCount })
})

const updatePaymentToSeller = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const oldPaymenToSellerDetails = await PaymentToSeller.findById(id)
    if (!oldPaymenToSellerDetails) {
        res.status(400)
        throw new Error("Payment to seller info not found")
    }

    await PaymentToSeller.findByIdAndUpdate(id, {
        ...req.body,
        seller: req.seller._id
    })

    const updatePaymentToSeller = await PaymentToSeller.find(id)
    res.status(200).json(updatePaymentToSeller)
})


export const linkSellerAccount = asyncHandler(async (req, res) => {
    const { _id: sellerId } = req.seller;

    try {
        const [findSeller, isPaymentConfig] = await Promise.all([
            SellerModel.findOne({ _id: sellerId }),
            PaymentAccountLinkModel.findOne({ sellerId })
        ]);

        if (!findSeller) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                message: ResponseMessage.USER_NOT_EXIST,
                data: null,
            });
        }

        // Prepare data for Stripe API
        const data = qs.stringify({
            'country': 'US',
            'controller[fees][payer]': 'application',
            'controller[losses][payments]': 'application',
            'controller[stripe_dashboard][type]': 'express',
            'email': findSeller.email,
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.stripe.com/v1/accounts',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedApiKey}`
            },
            data: data
        };

        // Request to Stripe API
        const stripeResponse = await axios.request(config);

        // Create account link for the seller
        const accountLink = await stripeInstance.accountLinks.create({
            account: stripeResponse?.data?.id,
            type: 'account_onboarding',
            refresh_url: 'http://localhost:3000',
            return_url: `http://localhost:3000/dashboard`
        });

        // Prepare response object
        const paymentData = {
            sellerId,
            email: findSeller.email,
            accountId: stripeResponse?.data?.id,
            url: accountLink.url,
        };

        let updatedData;
        
        // isPaymentConfig?.status === "COMPLETED"
        if (true) {
            // Update existing payment configuration
            updatedData = await PaymentAccountLinkModel.findOneAndUpdate(
                { sellerId },
                paymentData,
                { new: true }
            );
        } else {
            // Create new payment configuration
            updatedData = await PaymentAccountLinkModel.create(paymentData);
        }

        console.log("updatedData",updatedData, sellerId)
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ACCOUNT_LINK,
            data: updatedData,
        });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            data: error.message,
        });
    }
})


export const transferToSeller = asyncHandler(async (req, res) => {
    try {
        let { amount } = req.body
        const { _id: sellerId } = req.seller;
        const amountInCents = Math.round(amount * 100);

        const [findSeller, isPaymentConfig] = await Promise.all([
            SellerModel.findOne({ _id: sellerId }),
            PaymentAccountLinkModel.findOne({ sellerId })
        ]);

        console.log("isPaymentConfig",isPaymentConfig)

        const transfer = await stripeInstance.transfers.create({
            amount: amountInCents,
            currency: 'usd',
            destination: isPaymentConfig.accountId,
            transfer_group: 'ORDER_95',
        });

        if (!transfer) {
            return res.status(400).json({
                status: StatusCodes.BAD_REQUEST,
                message: "Payment failed",
                data: null,
            });

        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: "Payment successful",
            data: transfer,
        });


    } catch (error) {
        console.log("217",error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            data: error.message,
        });

    }
})





export {
    getAllPaymentToSeller,
    addPaymentToSeller,
    getSinglePaymentToSeller,
    totalPaymentToSeller,
    getAllsinglePaymentToSeller,
    updatePaymentToSeller,
};
