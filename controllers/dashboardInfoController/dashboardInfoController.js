import asyncHandler from "express-async-handler";
import Customer from "#models/userModels/customerModel/customerModel.js";
import Seller from "#models/userModels/sellerModel/sellerModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import PaymentToSeller from "#models/paymentToSellerModel/paymentToSellerModel.js";
import PaymentRecieve from "#models/paymentRecivedModel/paymentRecivedModel.js";
import Order from "#models/orderModels/orderModel.js";
import mongoose from "mongoose";
import moment from "moment";
import { StatusCodes } from "http-status-codes";
import { ResponseMessage } from "#controllers/utils/ResponseMessage.js";
import bcrypt from 'bcryptjs'
import EmployeeModel from "#models/userModels/employeeModel/employeeModel.js";

const { genSalt, hash, compare } = bcrypt

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

export const adminChangePassword = asyncHandler(async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;
    const user = await EmployeeModel.findById(req.employee);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: ResponseMessage.USER_NOT_EXIST,
      });
    }

    if (user && (await compare(oldPassword, user.password))) {

      // Hash Password
      const salt = await genSalt(10)
      const hashedPassword = await hash(newPassword, salt)
      await EmployeeModel.findOneAndUpdate({ _id: user._id }, { password: hashedPassword }).exec()

      return res.status(StatusCodes.OK).json({
        message: ResponseMessage.PASSWORD_UPDATED,
        data: [],
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      message: ResponseMessage.OLD_PASSWORD_INCORRECT,
      data: [],
    });

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }

});

export const getProfileData = asyncHandler(async (req, res) => {
  try {
    const user = await EmployeeModel.findById(req.employee);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: ResponseMessage.USER_NOT_EXIST,
      });
    }
    
    if (req.body &&  req.body.name && Object.keys(req.body).length > 0 ) {
      let getProfileData = await EmployeeModel.findOneAndUpdate({ _id: user._id },{...req.body }, { new: true }).select('-password')

      return res.status(StatusCodes.OK).json({
        message: ResponseMessage.PROFILE_DATA,
        data: getProfileData,
      });
    }

    let getProfileData = await EmployeeModel.findOne({ _id: user._id }).select('-password');

    return res.status(StatusCodes.OK).json({
      message: ResponseMessage.FETCH_DATA,
      data: getProfileData,
    });
    

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
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
          $match: {
            seller: mongoose.Types.ObjectId(id),
            ...dateFilter
          }
        },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "store",
            as: "orders"
          }
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: 1 }
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
      allSalesData

    };
    res.status(200).json(responseData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

const sellerDashboardRevenueGraph = asyncHandler(async (req, res) => {
  try {

    const limit = req.params.limit;
    // let startOfWeek1 = moment().startOf('week').local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
    // let endOfWeek1 = moment().endOf('week').local().set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toDate();

    // Get today's date
    let today = moment('2024-10-07');
    let startOfWeek = today.clone().day(6).startOf('day');

    if (today.day() < 6) {
      startOfWeek.subtract(1, 'weeks');
    }
    let endOfWeek = today.clone().day(5).endOf('day');

    if (today.day() > 5) {
      endOfWeek.add(1, 'weeks');
    }

    // console.log("Start of Week (Saturday):", startOfWeek.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate());
    // console.log("End of Week (Friday):", endOfWeek.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate());

    if (limit == "weekly") {
      const result = await PaymentRecieve.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate(),
              $lte: endOfWeek.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate(),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            totalRevenue: { $sum: '$amount' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const response = daysOfWeek.map(day => {
        const entry = result.find(item => item._id === daysOfWeek.indexOf(day) + 1) || { totalRevenue: 0 };
        return { Day: day, totalRevenue: entry.totalRevenue };
      });

      return res.status(200).json({
        status: 200,
        data: response,
      });
    }

    if (limit == "yearly") {
      const monthsArray = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const pipeline = [
        {
          $group: {
            _id: { $month: '$createdAt' },
            totalRevenue: { $sum: '$amount' },
          },
        },
        {
          $project: {
            month: {
              $arrayElemAt: [
                monthsArray,
                { $subtract: ['$_id', 1] }
              ],
            },
            totalRevenue: 1,
            _id: 0,
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $group: {
            _id: null,
            data: { $push: { month: '$month', totalRevenue: '$totalRevenue' } }
          }
        },
        {
          $project: {
            _id: 0,
            data: {
              $setUnion: [
                '$data',
                {
                  $map: {
                    input: {
                      $filter: {
                        input: monthsArray,
                        as: 'month',
                        cond: { $not: { $in: ['$$month', '$data.month'] } }
                      }
                    },
                    as: 'month',
                    in: { month: '$$month', totalRevenue: 0 }
                  }
                }
              ]
            }
          }
        },
        {
          $unwind: "$data"
        },
        {
          $addFields: {
            sortIndex: { $indexOfArray: [monthsArray, "$data.month"] }
          }
        },
        {
          $sort: { sortIndex: 1 }
        },
        {
          $group: {
            _id: null,
            data: { $push: "$data" }
          }
        },
        {
          $project: {
            _id: 0,
            data: 1
          }
        }
      ];

      try {
        const result = await PaymentRecieve.aggregate(pipeline);
        return res.status(200).json({
          status: 200,
          data: result.length > 0 ? result[0].data : [],
        });
      } catch (error) {
        console.error(error);
      }
    }


    if (limit == "monthly") {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();

      const pipeline = [
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lte: new Date(currentYear, currentMonth - 1, lastDayOfMonth),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            totalRevenue: { $sum: '$amount' },
          },
        },
        {
          $project: {
            day: "$_id",
            totalRevenue: 1,
            _id: 0,
          },
        },
        {
          $sort: { day: 1 },
        },
      ];


      try {
        const result = await PaymentRecieve.aggregate(pipeline);
        const response = Array.from({ length: lastDayOfMonth }, (_, i) => {
          const day = i + 1;
          const entry = result.find((item) => item.day === day) || {
            day,
            totalRevenue: 0,
          };
          return { day: entry.day, totalRevenue: entry.totalRevenue };
        });
        return res.status(200).json({
          status: 200,
          // message: responeMessage.MONTHLY,
          data: response,
        });
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
          error: error.message,
        });
      }

    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });

  }
})

export { adminDashboardInfo, sellerDashboardInfo, sellerDashboardRevenueGraph };
