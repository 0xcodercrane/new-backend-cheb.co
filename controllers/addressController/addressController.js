import asyncHandler from 'express-async-handler';
import Address from "#models/addressModel/addressModel.js"
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { ResponseMessage } from '#controllers/utils/ResponseMessage.js';
import sellerStoreModel from '#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js';
import Customer from '#models/userModels/customerModel/customerModel.js';






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

//get carrier charge && delivery date.
export const getCarrierCharge = asyncHandler(async (req, res) => {
    try {
        const { city, state, storeId, street, zipCode } = req.body;

        let findStoreData = await sellerStoreModel.findOne({ _id: storeId })
        let findCustomerInfo = await Customer.findOne({ _id: req.customer })

        // return false;

        let data = JSON.stringify({
            shipment: {
                to_address: {
                    name: "Dr. Steve Brule",
                    street1: street,
                    city: city,
                    state: state,
                    zip: zipCode,
                    // country: "US",
                    // phone: "8573875756",
                    email: findCustomerInfo.email
                },
                from_address: {
                    name: "EasyPost",
                    street1: findStoreData.street,
                    street2: findStoreData.stree,
                    city: findStoreData.city,
                    state: findStoreData.state,
                    zip: findStoreData.zipCode,
                    // country: findStoreData,
                    phone: findStoreData.mobile,
                    email: findStoreData.email
                },
                parcel: {
                    length: "20.2",
                    width: "10.9",
                    height: "5",
                    weight: "65.9"
                },
                carrier_account_id: "ca_0594c71bc7b1482198e8c6d71d23c792"
            }
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.easypost.com/v2/shipments',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer EZTKe5d678be09e3473f887e5bc7091e9a46Y0fuSBk01h2haswJOVpTag'
            },
            data: data
        };

        let response = await axios.request(config);
        const filteredRates = response.data.rates.filter(rate => rate.delivery_date !== null);

        console.log("response",config)

        const lowestRate = filteredRates.reduce((prev, curr) => {
            return parseFloat(curr.rate) < parseFloat(prev.rate) ? curr : prev;
        });

        return res.status(StatusCodes.OK).json({
            data: lowestRate,
            response: response.data.rates
        });
    } catch (err) {
        console.log("err",err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ResponseMessage.INTERNAL_SERVER_ERROR,
            data: err.message,
        });
    }



})

export {
    getAllAddresses,
    getSingleAddress,
    getMyAddresses,
    setAddress,
    updateAddress,
    deleteAddress,
    getCustomerAddressesById
}