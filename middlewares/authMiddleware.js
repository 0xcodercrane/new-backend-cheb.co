import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Employee from "../models/userModels/employeeModel/employeeModel.js";
import Seller from "../models/userModels/sellerModel/sellerModel.js";
import Customer from "#models/userModels/customerModel/customerModel.js";

const { verify } = jwt;

const protectForEmployee = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = verify(token, process.env.JWT_SECRET);

      req.employee = await Employee.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log(error);
      res.send(401);
      throw new Error("Not Authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const protectForSeller = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = verify(token, process.env.JWT_SECRET);

      req.seller = await Seller.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log(error);
      res.send(401);
      throw new Error("Not Authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const protectForCustomer = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);

      const decoded = verify(token, process.env.JWT_SECRET);

      req.customer = await Customer.findById(decoded.id).select("-password");
      //  res.send(401)
      next();
    } catch (error) {
      console.log(error);
      res.send(401);
      throw new Error("Not Authorized");
    }
  }
});

export { protectForEmployee, protectForSeller, protectForCustomer };
