import asyncHandler from 'express-async-handler';

import Address from '../../models/addressModels/addressModel.js';
import DefaultAddress from '../../models/addressModels/defaultAddressModel.js';

// Make Default Address
const makeDefaultAddress = asyncHandler( async (req, res) => {

    const address = req.params.id

    if (!req.customer) {
        res.status(400);
        throw new Error('Customer Not Found')
    }

    const doesAddressExist = await Address.findById(address)
    if(!doesAddressExist) {
        res.status(400);
        throw new Error('Address Not Found')
    }

    const doesDefaultAddressExist = await DefaultAddress.findOne({customer: req.customer})

    if(doesDefaultAddressExist) {
        await doesDefaultAddressExist.remove()
    }

    const newDefaultAddress = await DefaultAddress.create({
        customer: req.customer,
        address
    })

    res.status(200).json(newDefaultAddress)
})

// Get My Addresses
const getMyDefaultAddress = asyncHandler( async (req, res) => {
    
    if(!req.customer) {
        res.status(400);
        throw new Error('Customer Not Found')
    }

    const defaultAddress = await DefaultAddress.findOne({customer: req.customer._id})

    res.status(200).json(defaultAddress)

})

export {
    getMyDefaultAddress,
    makeDefaultAddress
}