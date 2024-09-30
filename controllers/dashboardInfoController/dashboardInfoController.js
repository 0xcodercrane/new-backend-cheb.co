import asyncHandler from "express-async-handler";
import Customer from "#models/userModels/customerModel/customerModel.js";
import Seller from "#models/userModels/sellerModel/sellerModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import PaymentToSeller from "#models/paymentToSellerModel/paymentToSellerModel.js";
import PaymentRecieve from "#models/paymentRecivedModel/paymentRecivedModel.js";
import Order from "#models/orderModels/orderModel.js";
import mongoose from "mongoose";

const adminDashboardInfo = asyncHandler(async (req, res) => {
  try {
    const [
      sellerCount,
      customerCount,
      storeCount,
      totalOrderValue,
      totalPaymentToSeller,
    ] = await Promise.all([
      Seller.countDocuments(),
      Customer.countDocuments(),
      SellerStore.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalSum: { $sum: "$total" },
          },
        },
      ]).exec(),
      PaymentToSeller.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]).exec(),
    ]);

    const roundedTotalSum = Math.round(totalOrderValue[0].totalSum);
    const roundedTotalAmount = Math.round(totalPaymentToSeller[0].totalAmount);

    res.json({
      sellerCount,
      customerCount,
      storeCount,
      totalOrderValue: roundedTotalSum,
      totalPaymentToSeller: roundedTotalAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

const sellerDashboardInfo = asyncHandler(async (req, res) => {
  const id = req.seller._id;
  try {
    const fromDate = req.query?.from ? new Date(req.query.from) : null;
    const toDate = req.query?.to ? new Date(req.query.to) : null;
    const from = fromDate ? new Date(fromDate.setUTCHours(0, 0, 0, 0)) : null;
    const to = toDate ? new Date(toDate.setUTCHours(23, 59, 59, 999)) : null;
    const dateFilter = (from && to) ? { createdAt: { $gte: from, $lt: to } } : {};
    const dateOfPaymentFilter = (from && to) ? { dateOfPayment: { $gte: from, $lt: to } } : {};
  

    const [
      totalPaidValue,
      allPaymentsToSeller,
      paymentApprovalCount,
      totalEarningAmounts,
      allSalesData
       
    ] = await Promise.all([
      PaymentToSeller.aggregate([
        {
          $match: {
            seller: mongoose.Types.ObjectId(id),
            ...dateOfPaymentFilter
          }
        },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
      PaymentToSeller.find({ seller: id, ...dateOfPaymentFilter }).populate("seller"),
      PaymentToSeller.countDocuments({ seller: id, isApprove: false, ...dateOfPaymentFilter }),
      PaymentRecieve.aggregate([
        {
          $match: {
            seller: mongoose.Types.ObjectId(id),
            ...dateFilter
          }
        },
        {
          $lookup: {
            from: "orders",
            let: { orderId: "$order" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$orderId"] }, 
                     ...(req.query.earning !== "all" ? [{ $eq: ["$paymentMethod", req.query.earning] }] : []) 
                    ]
                  }
                }
              }
            ],
            as: "payments",
          },
        },
        {
          $unwind: "$payments",
        },
        {
          $group: {
            _id: null,  
            totalEarningAmount: { $sum: "$payments.subtotal" }  
          }
        }
      ]),

      //Seller.
      SellerStore.aggregate([
        {
          $match:{
            seller: mongoose.Types.ObjectId(id),
           ...dateFilter
          }
        }
      ])

    ]);

    const responseData = {
      totalOrderValue: totalEarningAmounts.length 
        ? Math.round(totalEarningAmounts[0].totalEarningAmount)
        : 0,

      totalPaidValue: totalPaidValue.length
        ? Math.round(totalPaidValue[0].totalAmount)
        : 0,
      allPaymentsToSeller,
      paymentApprovalCount,
      // totalEarningAmounts,
      // allSalesData

    };
    res.status(200).json(responseData);


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

export { adminDashboardInfo, sellerDashboardInfo };
