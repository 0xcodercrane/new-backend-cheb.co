import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';


import Customer from "../../../models/userModels/customerModel/customerModel.js"
import { generateToken } from '#utils/helperFunction.js';
import { uploadObject } from '#config/space.js';
import { sendCustomerVerifyEmail } from '#config/email/emailFormats/sendCustomerVerifyEmail.js';
import { sendForgotPasswordMail } from '#config/email/emailFormats/sendClientContactForgotPasswordMail.js';


const { genSalt, hash, compare } = bcrypt
const { sign, verify } = jwt


// Register Seller
const registerCustomer = asyncHandler(async (req, res) => {

  try {
    const { name, email, password, mobile, isProductInCart } = req.body;
    // const { dp } = req?.files

    console.log("user data: ", req?.body)
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please add all fields");
    }

    //Employee Email Present Or Not
    const emailExistsCustomer = await Customer.findOne({ email });

    console.log("emailExistsCustomer", emailExistsCustomer)

    if (emailExistsCustomer) {
      res.status(400);
      throw new Error("Customer Exists");
    }

    // console.log("dp", Object.keys(dp).length > 0 )
    // for dp


    let dpUrl; // Declare dpUrl outside of the block

    if (req.files && req.files.dp) {
      const { dp } = req.files;
      dpUrl = `cheb/customer/${Date.now() + "-" + dp?.name}`
      await uploadObject(dpUrl, dp.data);
    }

    console.log("dp", dpUrl)

    // Hash Password
    const salt = await genSalt(10);
    console.log("salt", salt)

    const hashedPassword = await hash(password, salt);
    console.log("hashedPassword", hashedPassword, mobile)

    const customer = await Customer.create({
      name,
      email,
      ...(mobile !== undefined && { mobile }),
      password: hashedPassword,
      ...(dpUrl !== undefined && { dp: dpUrl }),
    });


    console.log("isProductInCart", !isProductInCart && customer)

    // return false;

    if (!isProductInCart && customer) {
      const token = generateToken(customer._id);

      const link = process.env.CONSUMER_APP_LINK + "verifyEmail/" + token;

      const description =
        `Please verify your email and activate your CheB account by clicking the "Verify Now" button below.`;

      await sendCustomerVerifyEmail(customer.email, link, "Verify Now", description);

      res.status(201).json({
        _id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer?.mobile,
        isVerified: customer.isVerified,
        dp: customer?.dp,
        token,
        isProductInCart:false
      });
    }
    else if (isProductInCart && customer) {
      const token = generateToken(customer._id);
      res.status(201).json({
        _id: customer.id,
        name: customer.name,
        email: customer.email,
        token,
        isProductInCart:true
      });
    }
    else {
      res.status(400);
      throw new Error("Invalid Customer Data");
    }

  } catch (error) {
    console.error("Error during customer registration", error);
    res.status(500).json({ message: "Server Error" });

  }


});



// Get all customer
const getAllCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.find()
  res.status(200).json(customer)
})

// Get single customer
const getSingleCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params
  const customer = await Customer.findOne({ _id: id })
  res.status(200).json(customer)
})



// Login customer
const loginCustomer = asyncHandler(async (req, res) => {

  const { email, password } = req.body

  // Check for customer email
  const customer = await Customer.findOne({ email })

  if (!customer) {
    res.status(400)
    throw new Error('No customer found with this email')
  }

  // Check if password matches

  if (customer && (await compare(password, customer.password))) {
    res.status(200).json({
      _id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      isVerified: customer.isVerified,
      dp: customer.dp,
      token: generateToken(customer._id)
    })
  } else {
    res.status(400)
    throw new Error('Invalid Credentials')
  }

})


//verify Seller
const verifyCustomer = asyncHandler(async (req, res) => {
  const { token } = req.params;

  console.log("token", token)

  const decoded = verify(token, process.env.JWT_SECRET);

  //checking customer is present or not
  const oldCustomer = await Customer.findOne({ _id: decoded.id });

  console.log("decoded", decoded);

  if (!oldCustomer) {
    res.status(400);
    throw new Error("Customer Is Not Found!!");
  }

  const verifyCustomer = {
    isVerified: true,
  };

  await Customer.findByIdAndUpdate(oldCustomer._id, verifyCustomer);

  const verifiedCustomer = await Customer.findById(oldCustomer._id);

  if (verifiedCustomer) {
    res.status(201).json({
      _id: verifiedCustomer._id,
      name: verifiedCustomer.name,
      email: verifiedCustomer.email,
      phoneNumber: verifiedCustomer.mobile,
      isVerified: verifiedCustomer.isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid customer Data");
  }
});


const forgetCustomerPassword = asyncHandler(async (req, res) => {

  const { email } = req.body
  if (!email) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  //Customer Present Or Not
  const customer = await Customer.findOne({ email });
  if (!customer) {
    res.status(400)
    throw new Error('No Customer found with this email!!')
  }

  if (customer) {
    const token = generateToken(customer._id)

    const link = process.env.CONSUMER_APP_LINK + "forgetPassword/recoverPass/" + token
    const description = 'You have recently requested to reset your password for your associated email. Please click the link below to reset your password.'

    await sendForgotPasswordMail(customer.email, link, 'Reset Password', description)

    res.status(201).json({
      _id: customer.id,
      email: customer.email,
      token
    })

  } else {
    res.status(400)
    throw new Error('Failed to create Forgot Password Link!!')
  }

})


const resetCustomerPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword) {
    res.status(400)
    throw new Error('Please add new Password')
  }

  const decoded = verify(token, process.env.JWT_SECRET)

  const customerFromToken = await Customer.findById(decoded.id)

  if (!customerFromToken) {
    res.status(400)
    throw new Error('Could not generate customer from token')
  }

  // Hash Password
  const salt = await genSalt(10)
  const hashedPassword = await hash(newPassword, salt)

  const updateData = {
    password: hashedPassword
  }

  const updatedData = await Customer.findByIdAndUpdate(customerFromToken._id, updateData)

  res.status(200).json(updatedData)
})


export {
  getAllCustomer,
  loginCustomer,
  getSingleCustomer,
  registerCustomer,
  verifyCustomer,
  forgetCustomerPassword,
  resetCustomerPassword

}