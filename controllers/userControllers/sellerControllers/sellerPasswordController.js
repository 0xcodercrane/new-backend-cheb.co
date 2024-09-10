import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import Seller from "#models/userModels/sellerModel/sellerModel.js"

import { generateToken } from '#utils/helperFunction.js'
import { sendForgotPasswordMail } from '#config/email/emailFormats/sendClientContactForgotPasswordMail.js'

const { genSalt, hash, compare } = bcrypt
const { sign, verify } = jwt


// Forgot Seller Password
const forgotSellerPassword = asyncHandler (async (req,res) => {

    const {email} = req.body
    if (!email) {
        res.status(400)
        throw new Error('Please add all fields')
    }
    
    //Seller Present Or Not
    const oldSeller =await Seller.findOne({email});
    if(!oldSeller){
        res.status(400)
        throw new Error('No Seller found with this email!!')
    }

    if (oldSeller) {
        const token = generateToken(oldSeller._id)

        const link = process.env.SELLER_APP_LINK + "resetSellerPassword/" + token
        const description ='You have recently requested to reset your password for your associated email. Please click the link below to reset your password.'

        await sendForgotPasswordMail(oldSeller.email, link, 'Reset Password', description)

        res.status(201).json({
            _id: oldSeller.id,
            email: oldSeller.email,
            token
        })
        
    } else {
        res.status(400)
        throw new Error('Failed to create Forgot Password Link!!')
    }

})

//ResetPassword
const resetSellerPassword = asyncHandler (async (req,res) => {
    const { token, newPassword } = req.body;

    if (!newPassword) {
        res.status(400)
        throw new Error('Please add new Password')
    }

    const decoded = verify(token, process.env.JWT_SECRET)

    const SellerFromToken = await Seller.findById(decoded.id)

    if (!SellerFromToken) {
        res.status(400)
        throw new Error('Could not generate Seller from token')
    }

    // Hash Password
    const salt = await genSalt(10)
    const hashedPassword = await hash(newPassword, salt)

    const updateData = {
        password: hashedPassword
    }

    const updatedData = await Seller.findByIdAndUpdate(SellerFromToken._id, updateData)

    res.status(200).json(updatedData)
})

// Change Seller Password
const changeSellerPassword = asyncHandler (async (req,res) => {
    const { email, newPassword, confirmNewPassword } = req.body;

    if(!email || !newPassword || !confirmNewPassword){
        return res.status(400).json({ success: false, msg: "Invalied Email or Password!!"});
    }

    // Check for Seller email
    const Seller = await Seller.findOne({email})

    if(!Seller) {
        res.status(400)
        throw new Error('No Seller found with this email!!')
    }

    //compair password
    if(newPassword !== confirmNewPassword){
        res.status(400)
        throw new Error('Password Not Match!!')
    }

    // Hash Password
    const salt = await genSalt(10)
    const hashedPassword = await hash(newPassword, salt)

    const updateData = {
        password: hashedPassword
    }

    const updatedData = await Seller.findByIdAndUpdate({_id: Seller._id}, updateData, {
        new: true
    })

    res.status(200).json(updatedData)


})




export {
    changeSellerPassword,
    forgotSellerPassword ,
    resetSellerPassword 
}