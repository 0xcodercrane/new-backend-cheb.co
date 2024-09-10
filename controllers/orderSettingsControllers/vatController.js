import asyncHandler from 'express-async-handler';
import Vat from '../../models/orderSettingsModels/vatModel.js';

const getVats = asyncHandler( async (req, res) => {
    const vats = await Vat.find()
    res.status(200).json(vats)
})

const setVat = asyncHandler( async (req, res) => {

    const {amount, isApplicable} = req.body;

    if (!amount || !isApplicable) {
        res.status(400);
        throw new Error('Please add all fields!')
    }
    
    const vat = await Vat.create({

        amount,
        isApplicable

    })

    res.status(200).json(vat)

})

const updateVat = asyncHandler( async (req, res) => {
    const { id } = req.params
    const vat = await Vat.findById(id)

    if(!vat){
        res.status(400)
        throw new Error('Vat not Found')
    }

    await Vat.findByIdAndUpdate(id, {
        ...req.body
    })

    const updatedVat = await Vat.findById(id)

    res.status(200).json(updatedVat)
})

export {
    getVats,
    setVat,
    updateVat
}