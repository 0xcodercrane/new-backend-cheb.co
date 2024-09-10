import asyncHandler from 'express-async-handler';
import DeliveryFee from '../../models/orderSettingsModels/deliveryFeeModel.js';

const getDeliveryFees = asyncHandler( async (req, res) => {
    const deliveryFees = await DeliveryFee.find()
    res.status(200).json(deliveryFees)
})

const setDeliveryFee = asyncHandler( async (req, res) => {

    const {name, amount, isApplicable} = req.body;

    if (!name || !amount || !isApplicable) {
        res.status(400);
        throw new Error('Please add all fields!')
    }
    
    const deliveryFee = await DeliveryFee.create({
        
        name,
        amount,
        isApplicable

    })

    res.status(200).json(deliveryFee)

})

const updateDeliveryFee = asyncHandler( async (req, res) => {
    const { id } = req.params
    const deliveryFee = await DeliveryFee.findById(id)

    if(!deliveryFee){
        res.status(400)
        throw new Error('DeliveryFee not Found')
    }

    await DeliveryFee.findByIdAndUpdate(id, {
        ...req.body
    })

    const updatedDeliveryFee = await DeliveryFee.findById(id)

    res.status(200).json(updatedDeliveryFee)
})

const deleteDeliveryFee = asyncHandler( async (req, res) => {
    const deliveryFee = await DeliveryFee.findById(req.params.id)
    if (!deliveryFee) {
        res.status(400)
        throw new Error('DeliveryFee not Found')
    }

    await deliveryFee.remove()

    res.status(200).json({id: req.params.id})
})

export {
    getDeliveryFees,
    setDeliveryFee,
    updateDeliveryFee,
    deleteDeliveryFee
}