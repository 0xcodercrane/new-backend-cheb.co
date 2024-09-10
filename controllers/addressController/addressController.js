import asyncHandler from 'express-async-handler';
import Address from "#models/addressModel/addressModel.js"


// Get All Addresses
const getAllAddresses = asyncHandler( async (req, res) => {
    const addresses = await Address.find()
    res.status(200).json(addresses)
})

// Get My Addresses
const getSingleAddress = asyncHandler( async (req, res) => {
    const address = await Address.findById({_id: req.params.id})
    res.status(200).json(address)

})

// Get My Addresses
const getMyAddresses = asyncHandler( async (req, res) => {

    const addresses = await Address.find({customer: req.customer._id})

    res.status(200).json(addresses)

})

const getCustomerAddressesById = asyncHandler( async (req, res) => {
    
    const addresses = await Address.find({customer: req.params.id})
    res.status(200).json(addresses)

})

// Set Address
const setAddress = asyncHandler( async (req, res) => {
    const {state,city,street,zipCode,type} = req.body;
    if(!state || !city || !street || !zipCode || !type){
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
const updateAddress = asyncHandler( async (req, res) => {
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
const deleteAddress = asyncHandler( async (req, res) => {
    const address = await Address.findById(req.params.id)

    if (!address) {
        res.status(400)
        throw new Error('Address not Found')
    }

    await address.remove()

    res.status(200).json({deletedCount: true})
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