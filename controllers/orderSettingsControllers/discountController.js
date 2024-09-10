import asyncHandler from 'express-async-handler';
import Discount from '../../models/orderSettingsModels/discountModel.js';

const getDiscounts = asyncHandler( async (req, res) => {
    const discounts = await Discount.find()
    res.status(200).json(discounts)
})

const setDiscount = asyncHandler( async (req, res) => {

    const {amount, isApplicable} = req.body;

    if (!amount || !isApplicable) {
        res.status(400);
        throw new Error('Please add all fields!')
    }
    
    const discount = await Discount.create({

        amount,
        isApplicable

    })

    res.status(200).json(discount)

})

const updateDiscount = asyncHandler( async (req, res) => {
    const { id } = req.params
    const discount = await Discount.findById(id)

    if(!discount){
        res.status(400)
        throw new Error('Discount not Found')
    }

    await Discount.findByIdAndUpdate(id, {
        ...req.body
    })

    const updatedDiscount = await Discount.findById(id)

    res.status(200).json(updatedDiscount)
})

export {
    getDiscounts,
    setDiscount,
    updateDiscount
}