import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

import Seller from "#models/userModels/sellerModel/sellerModel.js";
import SellerCardInfo from "#models/sellerCardInfoModels/sellerCardInfoModels.js"

import { uploadObject } from "#config/space.js";
import { generateToken } from "#utils/helperFunction.js";
import { sendSellerVerifyEmail } from "#config/email/emailFormats/sendSellerVerifyEmail.js";

const { genSalt, hash, compare } = bcrypt;
const { sign, verify } = jwt;

const getSingleSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const seller = await Seller.findById(id);
  const cardInfo = await SellerCardInfo.find({seller: id})
  res.status(200).json({seller,cardInfo});
});

// Register Seller
const registerSeller = asyncHandler(async (req, res) => {
  const { name, email, password, address, phoneNumber,type } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // for dp

  // if(!req.files) {
  //     res.status(400)
  //     throw new Error('Please add Image')
  // }

  let dpUrl; // Declare dpUrl outside of the block

  if (req.files && req.files.dp) {
    const { dp } = req.files;
    dpUrl = `cheb/seller/${Date.now() + "-" + dp.name}`;
    await uploadObject(dpUrl, dp.data);
  }
  
//   const { dp } = req.files;

//   const dpUrl = `cheb/seller/${Date.now() + "-" + dp.name}`;

//   await uploadObject(dpUrl, dp.data);

  //Employee Email Present Or Not
  const emailExistsSeller = await Seller.findOne({ email });

  if (emailExistsSeller) {
    res.status(400);
    throw new Error("Seller Exists");
  }

  // Hash Password
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  const seller = await Seller.create({
    name,
    email,
    address,
    phoneNumber,
    password: hashedPassword,
    dp: dpUrl,
    type
  });

  if (seller) {
    const token = generateToken(seller._id);

    const link = process.env.SELLER_APP_LINK + "verifyEmail/" + token;

    const description =
      "We are excited to invite you to join CHEB official website as an Seller.To accept this invitation and gain access to the Seller Panel, please click on the button.";

    await sendSellerVerifyEmail(seller.email, link, "Verify Now", description);

    res.status(201).json({
      _id: seller.id,
      name: seller.name,
      email: seller.email,
      phoneNumber: seller.phoneNumber,
      isVerified: seller.isVerified,
      dp: seller.dp,
      type: seller.type,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Seller Data");
  }
});

//verify Seller
const verifySeller = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const decoded = verify(token, process.env.JWT_SECRET);

  //checking customer is present or not
  const oldSeller = await Seller.findOne({ _id: decoded.id });

  if (!oldSeller) {
    res.status(400);
    throw new Error("Customer Is Not Found!!");
  }

  const verifySeller = {
    isVerified: true,
  };

  await Seller.findByIdAndUpdate(oldSeller._id, verifySeller);

  const verifiedSeller = await Seller.findById(oldSeller._id);

  if (verifiedSeller) {
    res.status(201).json({
      _id: verifiedSeller._id,
      name: verifiedSeller.name,
      email: verifiedSeller.email,
      phoneNumber: verifiedSeller.phoneNumber,
      isVerified: verifiedSeller.isVerified,
      type: verifiedSeller.type,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Seller Data");
  }
});

// Login Seller
const loginSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for employee email
  const seller = await Seller.findOne({ email });

  if (!seller) {
    res.status(400);
    throw new Error("No seller found with this email");
  }

  // check seller is verified
  if (!seller.isVerified) {
    res.status(400);
    throw new Error("Seller is not verified");
  }

  // Check if password matches
  if (seller && (await compare(password, seller.password))) {
    res.status(200).json({
      _id: seller.id,
      name: seller.name,
      email: seller.email,
      level: seller.level,
      isVerified: seller.isVerified,
      dp: seller.dp,
      type:seller.type,
      token: generateToken(seller._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});


// const loginSeller = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   // Check for seller email
//   const seller = await Seller.findOne({ email });

//   if (!seller) {
//     return res.status(400).json({ message: "No seller found with this email" });
//   }

//   // Check if the seller is verified
//   if (!seller.isVerified) {
//     return res.status(400).json({ message: "Seller is not verified" });
//   }

//   const isPasswordMatch = await compare(password, seller.password);

//   if (isPasswordMatch) {
//     return res.status(200).json({
//       _id: seller.id,
//       name: seller.name,
//       email: seller.email,
//       level: seller.level,
//       isVerified: seller.isVerified,
//       dp: seller.dp,
//       type: seller.type,
//       token: generateToken(seller._id),
//     });
//   } else {
//     return res.status(400).json({ message: "Invalid Credentials" });
//   }
// });


// store add

export { registerSeller, loginSeller, verifySeller, getSingleSeller };
