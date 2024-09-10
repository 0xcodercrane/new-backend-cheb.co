import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import Employee from '../../../models/userModels/employeeModel/employeeModel.js'


import { sendForgotPasswordMail } from '#config/email/emailFormats/sendClientContactForgotPasswordMail.js'

import { generateToken } from '#utils/helperFunction.js'

const { genSalt, hash, compare } = bcrypt
const { sign, verify } = jwt


// Change Employee Password
const changeEmployeePassword = asyncHandler (async (req,res) => {
    const { email, newPassword, confirmNewPassword } = req.body;

    if(!email || !newPassword || !confirmNewPassword){
        return res.status(400).json({ success: false, msg: "Invalied Email or Password!!"});
    }

    // Check for employee email
    const employee = await Employee.findOne({email})

    if(!employee) {
        res.status(400)
        throw new Error('No employee found with this email!!')
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

    const updatedData = await Employee.findByIdAndUpdate({_id: employee._id}, updateData, {
        new: true
    })

    res.status(200).json(updatedData)


})

// Forgot Employee Password
const forgotEmployeePassword = asyncHandler (async (req,res) => {
    const {email} = req.body

    if (!email) {
        res.status(400)
        throw new Error('Please add all fields')
    }
    
    //Employee Present Or Not
    const oldEmployee =await Employee.findOne({email});
    if(!oldEmployee){
        res.status(400)
        throw new Error('No employee found with this email!!')
    }

    if (oldEmployee) {
        const token = generateToken(oldEmployee._id)

        //send mail
        // const link = "http://"+req.hostname+ ":5001/api/auth/verifyToken?token=" + token
        const link = process.env.ADMIN_APP_LINK + "resetEmployeePassword/" + token
        
        const description ='You have recently requested to reset your password for your associated email. Please click the link below to reset your password.'

        await sendForgotPasswordMail(oldEmployee.email, link, 'Reset Password', description)
        res.status(201).json({
            _id: oldEmployee.id,
            email: oldEmployee.email,
            token
        })
        
    } else {
        res.status(400)
        throw new Error('Failed to create Forgot Password Link!!')
    }

})

//ResetPassword
const resetEmployeePassword = asyncHandler (async (req,res) => {
    const { token, newPassword } = req.body;

    if (!newPassword) {
        res.status(400)
        throw new Error('Please add new Password')
    }

    const decoded = verify(token, process.env.JWT_SECRET)

    const employeeFromToken = await Employee.findById(decoded.id)

    if (!employeeFromToken) {
        res.status(400)
        throw new Error('Could not generate employee from token')
    }

    // Hash Password
    const salt = await genSalt(10)
    const hashedPassword = await hash(newPassword, salt)

    const updateData = {
        password: hashedPassword
    }

    const updatedData = await Employee.findByIdAndUpdate(employeeFromToken._id, updateData)

    res.status(200).json(updatedData)

})




export {
    changeEmployeePassword,
    forgotEmployeePassword,
    resetEmployeePassword
}