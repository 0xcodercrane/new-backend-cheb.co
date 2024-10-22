import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import Employee from '#models/userModels/employeeModel/employeeModel.js'
import Customer from "#models/userModels/customerModel/customerModel.js"
import Seller from "#models/userModels/sellerModel/sellerModel.js"
import EmployeeInvite from '#models/userModels/employeeModel/employeeInviteModel.js'
import { deleteObject, uploadObject, updateObject } from '../../../config/space.js';
import { generateToken } from '#utils/helperFunction.js'


const { genSalt, hash, compare } = bcrypt
const { sign, verify } = jwt

// Register Employee
const registerEmployee = asyncHandler(async (req, res) => {
    const { name, email, password, level } = req.body

    if (!name || !email || !password || !level) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    if (!req.files) {
        res.status(400)
        throw new Error('Please add Image')
    }

    const { dp } = req.files

    const dpUrl = `cheb/employee/${Date.now() + '-' + dp.name}`

    await uploadObject(dpUrl, dp.data)

    //Employee Email Present Or Not
    const emailExistsAsEmployee = await Employee.findOne({ email })

    if (emailExistsAsEmployee) {
        res.status(400)
        throw new Error('Employee Exists')
    }

    const employeeInvitation = await EmployeeInvite.findOne({ email });
    if (!employeeInvitation) {
        res.status(400)
        throw new Error('Employee Is Not Found!!')
    }

    // Hash Password
    const salt = await genSalt(10)
    const hashedPassword = await hash(password, salt)

    const employee = await Employee.create({
        name,
        email,
        level,
        password: hashedPassword,
        dp: dpUrl
    })

    if (employee) {
        res.status(201).json({
            _id: employee.id,
            name: employee.name,
            email: employee.email,
            level: employee.level,
            dp: employee.dp,
            token: generateToken(employee._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid Employee Data')
    }

    await EmployeeInvite.deleteOne({ email });
    //    console.log(employeeDelete)
})


// Login Employee
const loginEmployee = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    // Check for employee email
    const employee = await Employee.findOne({ email })


    if (!employee) {
        res.status(400)
        throw new Error('No employee found with this email')
    }

    // Check if password matches

    if (employee && (await compare(password, employee.password))) {
        res.status(200).json({
            _id: employee.id,
            name: employee.name,
            email: employee.email,
            level: employee.level,
            dp: employee.dp,
            token: generateToken(employee._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid Credentials')
    }

})

// employees
const getAllEmployees = asyncHandler(async (req, res) => {

    const { filter } = req.query;
    let query = {};

    if (filter === 'archive') {
        query.isArchive = true;
    } else if (filter === 'active') {
        query.isArchive = false;
    }

    const employees = await Employee.find(query).select('-password -token -fcmtoken');
    res.status(200).json(employees);
});


const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET)

    const employee = await Employee.findOne({ _id: decoded.id })

    if (!employee) {
        res.status(400);
        throw new Error("Employee not found")
    }

    if (!employee.level === "admin") {
        res.status(400);
        throw new Error("Employee is not admin")
    }

    const deleteEmployee = await Employee.deleteOne({ _id: id })
    res.status(200).json(deleteEmployee)
})


const archiveEmployee = asyncHandler(async (req, res) => {
    const updateData = { ...req.body };
    const [employee, seller] = await Promise.all([
        Employee.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password -token -fcmtoken'),
        Seller.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password -token -fcmtoken')
    ]);
    res.status(200).json(employee ? employee : seller);
})

//  customers
const getAllCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find()
    res.status(200).json(customers)
})

const totalCustomers = asyncHandler(async (req, res) => {
    const totalCustomers = await Customer.estimatedDocumentCount();
    res.status(200).json(totalCustomers)
})

//  sellers
const getAllSellers = asyncHandler(async (req, res) => {
    const sellers = await Seller.find()
    res.status(200).json(sellers)
})

const totalSellers = asyncHandler(async (req, res) => {
    const totalSellers = await Seller.estimatedDocumentCount();
    res.status(200).json(totalSellers)
})

const addSellerType = asyncHandler(async (req, res) => {
    const sellers = await Seller.find()

    sellers.forEach(async (seller) => {
        await Seller.findByIdAndUpdate(seller._id, {
            type: "Sneaker Store"
        })
    })

    res.status(200).json(sellers)
})

// Get My Employee Data
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.employee)
})


export {
    getAllEmployees,
    deleteEmployee,
    getAllCustomers,
    getAllSellers,
    registerEmployee,
    loginEmployee,
    getMe,
    archiveEmployee,
    totalSellers,
    totalCustomers,
    addSellerType
}