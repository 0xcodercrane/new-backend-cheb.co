import asyncHandler from "express-async-handler";
import Customer from "#models/userModels/customerModel/customerModel.js";
import { generateToken } from "#utils/helperFunction.js";
import { updateObject } from "#config/space.js";

const updateProfile = asyncHandler(async (req, res) => {
  const id = req.customer._id;

  console.log(req.body);
  const customer = await Customer.findById(id);
  if (!customer) {
    res.status(400);
    throw new Error("Customer not Found");
  }

  if (!req.files) {
    await Customer.findByIdAndUpdate(id, {
      ...req.body,
    });
  }
  console.log("dp", req.files.dp);
  // if have image
  if (req.files.dp) {
    const { dp } = req.files;
    const imageUrl = `cheb/customer/dp/${Date.now() + "-" + dp.name}`;
    // await updateObject(imageUrl, dp.data, customer.dp);
    await updateObject(imageUrl, dp.data);
    const uploadImageUrl = imageUrl;

    console.log("image url is", uploadImageUrl);

    await Customer.findByIdAndUpdate(id, {
      dp: uploadImageUrl,
      ...req.body,
    });
  }

  const updatedCustomer = await Customer.findById(id);

  console.log("updated customer is", updatedCustomer);

  res.status(200).json({
    _id: updatedCustomer.id,
    name: updatedCustomer.name,
    mobile: updatedCustomer.mobile,
    email: updatedCustomer.email,
    dp: updatedCustomer.dp,
    token: generateToken(updatedCustomer._id),
  });

  // res.status(200).json(updatedCustomer)
});

const singleProfile = asyncHandler(async (req, res) => {
  const id = req.customer._id;
  const customer = await Customer.findById(id);
  res.status(200).json(customer);
});

export { updateProfile, singleProfile };
