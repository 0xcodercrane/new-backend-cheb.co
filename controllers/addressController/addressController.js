import asyncHandler from 'express-async-handler';
import Address from "#models/addressModel/addressModel.js"
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { ResponseMessage } from '#controllers/utils/ResponseMessage.js';
import sellerStoreModel from '#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js';
import Customer from '#models/userModels/customerModel/customerModel.js';
import orderModel from '#models/orderModels/orderModel.js';
import sellerModel from '#models/userModels/sellerModel/sellerModel.js';
import PaymentAccountLinkModel from '#models/paymentLinkModel/paymentLinkModel.js';
import stripe from 'stripe';
const stripeInstance = stripe('sk_test_51PRAwuBY5VOE3pmxe6shSx1OUU3WiTLudojkBgh2k2bIii9kx27QLx255vsDjO0gURPmSlK6KKEIjCPE0niQShiM009AfpfH9y'); //vishal sir
const apiKey = 'sk_test_51PRAwuBY5VOE3pmxe6shSx1OUU3WiTLudojkBgh2k2bIii9kx27QLx255vsDjO0gURPmSlK6KKEIjCPE0niQShiM009AfpfH9y';
const encodedApiKey = Buffer.from(apiKey).toString('base64');
import { ethers } from 'ethers';

import abi from '../../utils/abi.json' assert { type: 'json' };

// Get All Addresses
const getAllAddresses = asyncHandler(async (req, res) => {
    const addresses = await Address.find()
    res.status(200).json(addresses)
})

// Get My Addresses
const getSingleAddress = asyncHandler(async (req, res) => {
    const address = await Address.findById({ _id: req.params.id })
    res.status(200).json(address)

})

// Get My Addresses
const getMyAddresses = asyncHandler(async (req, res) => {

    const addresses = await Address.find({ customer: req.customer._id })

    res.status(200).json(addresses)

})

const getCustomerAddressesById = asyncHandler(async (req, res) => {

    const addresses = await Address.find({ customer: req.params.id })
    res.status(200).json(addresses)

})

// Set Address
const setAddress = asyncHandler(async (req, res) => {
    const { state, city, street, zipCode, type } = req.body;
    if (!state || !city || !street || !zipCode || !type) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    // if (!req.customer) {
    //     res.status(400);
    //     throw new Error('Customer Not Found')
    // }

    // const customerAddresses = await Address.find({customer: req.customer._id})
    // const addressLength = customerAddresses.length

    const address = await Address.create({
        type,
        state,
        city,
        street,
        // precedence,
        zipCode,
        customer: req.customer._id
    })

    // if(addressLength === 0){
    //     await DefaultAddress.create({
    //         customer: req.customer,
    //         address: address._id
    //     })
    // }

    res.status(200).json(address)
})

// Update Address
const updateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params

    const address = await Address.findById(id)

    if (!address) {
        res.status(400)
        throw new Error('Address not Found')
    }

    await Address.findByIdAndUpdate(id, {
        ...req.body
    })

    const updatedAddress = await Address.findById(id)

    res.status(200).json(updatedAddress)
})

// Delete Address
const deleteAddress = asyncHandler(async (req, res) => {
    const address = await Address.findById(req.params.id)

    if (!address) {
        res.status(400)
        throw new Error('Address not Found')
    }

    await address.remove()

    res.status(200).json({ deletedCount: true })
})



function filterRatesByDeliveryDays(rates, deliveryDaysRange) {
    let filteredRates = [];

    if (deliveryDaysRange === "1-3") {
        filteredRates = rates.filter(rate => rate.delivery_days >= 1 && rate.delivery_days <= 3);
    } else if (deliveryDaysRange === "3-7") {
        filteredRates = rates.filter(rate => rate.delivery_days >= 3 && rate.delivery_days <= 7);
    } else if (deliveryDaysRange === "7+") {
        let filterData = rates.filter(rate => rate.delivery_days >= 7)
        if (filterData.length > 0) {
            filteredRates = rates.filter(rate => rate.delivery_days >= 7);
        }
        else {
            filteredRates = rates;
        }
    }
    const lowestRate = filteredRates.length > 0 ? filteredRates.reduce((prev, curr) => {
        return parseFloat(curr.rate) < parseFloat(prev.rate) ? curr : prev;
    }) : null;
    return lowestRate ?? {};

}


//get carrier charge && delivery date.
export const getCarrierCharge = asyncHandler(async (req, res) => {
    try {
        const { city, state, storeId, street, zipCode, deliveryDays } = req.body;


        let totalHeight = 0;
        let totalWeight = 0;
        let totalLength = 0;
        let totalWidth = 0;

        req.body.cart.forEach((cartItem) => {
            totalHeight += cartItem.height || 0;
            totalWeight += cartItem.weight || 0;
            totalLength += cartItem.length || 0;
            totalWidth += cartItem.width || 0;

        });

        let findStoreData = await sellerStoreModel.findOne({ _id: storeId })
        let findCustomerInfo = await Customer.findOne({ _id: req.customer })


        let data = JSON.stringify({
            shipment: {
                to_address: {
                    name: findCustomerInfo?.name,
                    street1: street,
                    city: city,
                    state: state,
                    zip: zipCode,
                    // country: "US",
                    // phone: "8573875756",
                    email: findCustomerInfo?.email
                },
                from_address: {
                    name: "EasyPost",
                    street1: findStoreData?.street,
                    street2: findStoreData?.stree,
                    city: findStoreData?.city,
                    state: findStoreData?.state,
                    zip: findStoreData?.zipCode,
                    // country: findStoreData,
                    phone: findStoreData?.mobile,
                    email: findStoreData?.email
                },
                parcel: {
                    length: totalLength,
                    width: totalWidth,
                    height: totalHeight,
                    weight: totalWeight
                },
            }
        });


        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.EASY_POST_BASE_URL}/beta/rates`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EASY_POST_API_KEY}`
            },
            data: data
        };
        let response = await axios.request(config);
        
        const lowestRate = filterRatesByDeliveryDays(response.data.rates, deliveryDays);

        return res.status(StatusCodes.OK).json({
            // data: lowestRate,
            data: lowestRate,
        });
    } catch (err) {
        console.log("err", err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            data: err.message,
        });
    }


})


async function platformConfirmDelivery(orderHash) {
    try {

        //Crypto 
        const RPC_URL = process.env.SKALE_TESTNET_RPC;
        const CONTRACT_ADDRESS = process.env.SKALE_CHEB_PAYMENTS;
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const platformWallet = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);


        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, platformWallet);

        const gasEstimate = await contract.confirmDelivery.estimateGas(orderHash);
        console.log("Estimated gas for delivery confirmation:", gasEstimate.toString());

        const tx = await contract.confirmDelivery(
            orderHash,
            {
                gasLimit: Math.ceil(gasEstimate * 1.2) // Add 20% buffer
            }
        );

        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: tx.hash,
            orderHash
        };
    } catch (err) {
        console.error("Error confirming delivery:", err);
        return { success: false, error: err };
    }
};


async function updateTrackingStatusInDB(trackingCode, status, trackingDetails) {
    try {
        // Find the tracking record in the database based on tracking code
        const trackingRecord = await orderModel.findOne({ trackingCode });

        if (!trackingRecord) {
            console.log('Tracking record not found');
            return;
        }

        trackingRecord.orderStatus = status;
        trackingRecord.tracking_details = trackingDetails;

        await trackingRecord.save();

        if (trackingRecord.orderStatus == "delivered" && trackingRecord.paymentMethod == "Stripe") {

            const amountInCents = Math.round(trackingRecord.subtotal * 100);


            const [findSellerStore] = await Promise.all([
                sellerStoreModel.findOne({ _id: trackingRecord.store }),
            ]);
            const findSeller = await sellerModel.findOne({ _id: findSellerStore.seller });
            const isPaymentConfig = await PaymentAccountLinkModel.findOne({ sellerId: findSeller._id })

            // console.log("isPaymentConfig", findSeller, isPaymentConfig)

            const transfer = await stripeInstance.transfers.create({
                amount: amountInCents,
                currency: 'usd',
                destination: isPaymentConfig.accountId,
                transfer_group: 'ORDER_95',
            });
            // console.log("transfer",transfer)

            if (!transfer) {
                return res.status(400).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: "Payment failed",
                    data: null,
                });

            }

        }
        else {
        //   const {success, orderHash, transactionHash} =  platformConfirmDelivery(trackingRecord.transactionHash);
          const {success, orderHash, transactionHash} =  platformConfirmDelivery("0x54d7620e98b20324432284fd36430af48615a27a0e9055de5f0ae8efd0068866");

            console.log("success315",success, orderHash, transactionHash)
        }
        console.log(`Tracking status updated for ${trackingCode}: ${status}`);
    } catch (error) {
        console.error('Error updating tracking status:', error);
    }
}


export const updateDeliveryStatus = asyncHandler(async (req, res) => {
    // const { result } = req.body;

    // console.log("tracking order", req.body)
    const result = {
        "id": "trk_02711510c1c84ed2ad3571a2f96d1176",
        "object": "Tracker",
        "mode": "test",
        "tracking_code": "EZ7000000007",
        "status": "delivered",
        "status_detail": "status_update",
        "created_at": "2024-10-25T06:01:00Z",
        "updated_at": "2024-10-25T06:01:00Z",
        "signed_by": null,
        "weight": null,
        "est_delivery_date": "2024-10-25T06:01:00Z",
        "shipment_id": null,
        "carrier": "USPS",
        "tracking_details": [
            {
                "object": "TrackingDetail",
                "message": "Pre-Shipment Info Sent to USPS",
                "description": "",
                "status": "pre_transit",
                "status_detail": "status_update",
                "datetime": "2024-09-25T06:01:00Z",
                "source": "USPS",
                "carrier_code": "",
                "tracking_location": {
                    "object": "TrackingLocation",
                    "city": null,
                    "state": null,
                    "country": null,
                    "zip": null
                }
            },
            {
                "object": "TrackingDetail",
                "message": "Shipping Label Created",
                "description": "",
                "status": "pre_transit",
                "status_detail": "status_update",
                "datetime": "2024-09-25T18:38:00Z",
                "source": "USPS",
                "carrier_code": "",
                "tracking_location": {
                    "object": "TrackingLocation",
                    "city": "HOUSTON",
                    "state": "TX",
                    "country": null,
                    "zip": "77063"
                }
            }
        ],
        "fees": [
            {
                "object": "Fee",
                "type": "TrackerFee",
                "amount": "0.00000",
                "charged": true,
                "refunded": false
            }
        ],
        "carrier_detail": {
            "object": "CarrierDetail",
            "service": "First-Class Package Service",
            "container_type": null,
            "est_delivery_date_local": null,
            "est_delivery_time_local": null,
            "origin_location": "HOUSTON TX, 77001",
            "origin_tracking_location": {
                "object": "TrackingLocation",
                "city": "HOUSTON",
                "state": "TX",
                "country": null,
                "zip": "77063"
            },
            "destination_location": "CHARLESTON SC, 29401",
            "destination_tracking_location": null,
            "guaranteed_delivery_date": null,
            "alternate_identifier": null,
            "initial_delivery_attempt": null
        },
        "public_url": "https://track.easypost.com/djE6dHJrXzAyNzExNTEwYzFjODRlZDJhZDM1NzFhMmY5NmQxMTc2"
    }

    if (result && result.object === "Tracker") {
        const { tracking_code, status, tracking_details } = result;

        // Update your database with the tracking status
        updateTrackingStatusInDB(tracking_code, status, tracking_details);

        res.status(200).send("Webhook received");
    } else {
        res.status(400).send("Invalid data");
    }
});

export {
    getAllAddresses,
    getSingleAddress,
    getMyAddresses,
    setAddress,
    updateAddress,
    deleteAddress,
    getCustomerAddressesById
}