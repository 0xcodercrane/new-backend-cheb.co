import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import Employee from '../../../models/userModels/employeeModel/employeeModel.js'
import EmployeeInvite from '../../../models/userModels/employeeModel/employeeInviteModel.js'

import { generateToken } from '#utils/helperFunction.js'
import { sendEmployeeInvitationEmail } from '#config/email/emailFormats/sendEmployeeInvitationMail.js'

const { genSalt, hash, compare } = bcrypt
const { sign, verify } = jwt


// get email from token
const getEmailFromToken = asyncHandler (async (req,res) => {
    const { token } = req.params

    const decoded = verify(token, process.env.JWT_SECRET);

    const invite = await EmployeeInvite.findOne({_id: decoded.id});

    if(invite) {

        const {email} = invite

        res.status(201).json({
            email
        })

    } else {
        res.status(400)
        throw new Error('No Email Found with Token!!')
    }

})

// invite employee
const inviteEmployee = asyncHandler (async (req,res) => {

    const {email} = req.body
    if(req.employee.level !== 'admin') {
        res.status(400)
        throw new Error('You Must Be An Admin To Add Employees!!')
    }
    
    if(!email){
        res.status(400)
        throw new Error('Please Enter an Email')
    }

    const emailExistsAsEmployee = await Employee.findOne({email})

    if (emailExistsAsEmployee) {
        res.status(400)
        throw new Error('Employee Exists')
    }

    const emailExistsinInvite = await EmployeeInvite.findOne({email})

    if (emailExistsinInvite) {
        await emailExistsinInvite.remove()
    }

    const employeeInvite = await EmployeeInvite.create({
        email,
        employee: req.employee._id
    })

    if (employeeInvite) {
        const token = generateToken(employeeInvite._id)

        //send mail
        // const link = "http://"+req.hostname+ ":5001/api/auth/verifyToken?token=" + token

        const description ='We are excited to invite you to join CHEB official website as an administrator.To accept this invitation and gain access to the Admin User Panel, please click on the button.'

        const link = process.env.ADMIN_APP_LINK + "register/" + token
        
        await sendEmployeeInvitationEmail(employeeInvite.email, link, "Register Now",description)
        res.status(201).json({
            _id: employeeInvite.id,
            email: employeeInvite.email,
            token
        })
        
    } else {
        res.status(400)
        throw new Error('Failed to create employee invite')
    }


})

// get all invites
const getSingleInvite = asyncHandler (async (req,res) => {

    if(req.employee.level !== 'admin') {
        res.status(400)
        throw new Error('You Must Be An Admin To Add Employees!!')
    }
    
    const employeeInvite = await EmployeeInvite.findById(req.params.id)

    res.status(200).json(employeeInvite)
})

// get all invites
const getAllInvites = asyncHandler (async (req,res) => {

    if(req.employee.level !== 'admin') {
        res.status(400)
        throw new Error('You Must Be An Admin To Add Employees!!')
    }
    
    const employeeInvites = await EmployeeInvite.find()
    res.status(200).json(employeeInvites)
})

// delete invite
const deleteInvite = asyncHandler (async (req,res) => {

    if(req.employee.level !== 'admin') {
        res.status(400)
        throw new Error('You Must Be An Admin To Delete Invites!!')
    }
    
    const inviteToDelete = await EmployeeInvite.findById(req.params.id)

    if(!inviteToDelete) {
        res.status(400)
        throw new Error('Invite Not Found')
    }

    await inviteToDelete.remove()

    res.status(200).json({id: req.params.id})
})



// get email from token
const getEmailFromInviteToken = asyncHandler (async (req,res) => {
    const { token } = req.params

    const decoded = verify(token, process.env.JWT_SECRET);

    const invite = await EmployeeInvite.findOne({_id: decoded.id});

    if(invite) {

        const {email} = invite

        res.status(201).json({
            email
        })

    } else {
        res.status(400)
        throw new Error('No Email Found with Token!!')
    }

})
export {
    getEmailFromToken,
    inviteEmployee,
    getAllInvites,
    getSingleInvite,
    deleteInvite,
    getEmailFromInviteToken
}