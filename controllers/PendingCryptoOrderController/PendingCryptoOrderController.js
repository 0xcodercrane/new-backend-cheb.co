import Address from "#models/addressModel/addressModel.js";
import OrderItems from "#models/orderModels/orderItemsModel.js";
import Order from "#models/orderModels/orderModel.js";
import PendingCryptoOrder from "#models/PendingCryptoOrderModel/PendingCryptoOrder.js";
import Customer from "#models/userModels/customerModel/customerModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import asyncHandler from "express-async-handler";
import Seller from "#models/userModels/sellerModel/sellerModel.js";

import PaymentRecieve from "#models/paymentRecivedModel/paymentRecivedModel.js";
import SellerStoreProductSize from "#models/productModel/sellerStoreProductModel.js";

import { orderEmailToSeller } from "../../config/email/emailFormats/orderEmailToSeller.js";
import { sendPaymentInfoEmail } from "#config/email/emailFormats/sendPaymentInfoEmail.js";

import BoughtTogetherModel from "#models/productModel/boughtTogetherModel.js";


const addPendingCryptoOder = asyncHandler(async (req, res) => {
  const {
    store,
    cart,
    address,
    shippingFee,
    tax,
    subtotal,
    total,
    orderStatus,
    paymentMethod,
    pickupType,
    pickUpDate,
    pickupTime,
  } = req.body;
  const customer = req.customer._id;

  const { seller } = await SellerStore.findOne({
    _id: store,
  });
  const data = {
    customer,
    store,
    cart,
    address,
    shippingFee,
    tax,
    subtotal,
    total,
    orderStatus,
    paymentMethod,
    pickupType,
    pickUpDate,
    seller,
    pickupTime,
  };
  console.log(data);
  const pendingCryptoOder = await PendingCryptoOrder.create(data);
  console.log("pendingCryptoOder", pendingCryptoOder);

  res.status(200).send(pendingCryptoOder);
});

const getSinglePendingCryptoOrder = asyncHandler(async (req, res) => {
  console.log("hittinv");
  const { id } = req.params;

  const pendingCryptoOrder = await PendingCryptoOrder.findById(id);

  if (!pendingCryptoOrder) {
    res.status(404);
    throw new Error("Pending Crypto Order not found");
  }

  res.status(200).send(pendingCryptoOrder);
});


const createOrderByCrpyto = asyncHandler(async (req, res) => {
  const {
    address,
    customer,
    shippingFee,
    tax,
    discount,
    subtotal,
    total,
    cartItems,
    store,
    seller,
    transactionId,
    pickupDate,
    pickupTime,
    pickupType,
  } = req.body;

  const newOderData = {
    shippingFee,
    tax,
    subtotal,
    total,
    store,
    customer,
    orderStatus: "processing",
    paymentMethod: "Crypto",
    pickupType,
    pickupDate,
    pickupTime,
  };
  if (address) {
    newOderData.address = address;
  }

  const order = await Order.create(newOderData);

  const orderItemsFromCart = cartItems.map(
    (i) => (i = { ...i, order: order._id })
  );
  const createdOrderItems = await OrderItems.insertMany(orderItemsFromCart);

  const createPaymentRecived = await PaymentRecieve.create({
    order: order._id,
    amount: subtotal,
    store: store,
    seller: seller,
    transactionId: transactionId,
  });

  createdOrderItems.forEach(async (orderItem) => {
    await SellerStoreProductSize.findByIdAndUpdate(orderItem.size, {
      $inc: { stock: -orderItem.quantity },
    });
  });
  const customerInfo = await Customer.findOne({ _id: customer });

  let customerAddress;

  if (address) {
    customerAddress = await Address.findOne({ _id: address });
  }

  sendPaymentInfoEmail(customerInfo?.email, customerInfo, cartItems, {
    // processingFee,
    shippingFee,
    // authenticationFee,
    tax,
    // discount,
    orderId: order?._id,
    paymentMethod: order.paymentMethod,
    orderDate: order.createdAt,
    customerAddress,
    pickupDate,
    pickupTime,
    pickupType,
    total,
  });

  const singleSeller = await Seller.findById(seller);

  await orderEmailToSeller(
    singleSeller.email,
    cartItems,
    customerInfo,
    customerAddress,
    pickupDate,
    pickupTime,
    pickupType,
    newOderData?.subtotal
  );
  // Create bought together
  let existingRecommendation;

  if (cartItems.length > 1) {
    for (let i = 0; i < cartItems.length; i++) {
      for (let j = 0; j < cartItems.length; j++) {
        existingRecommendation = await BoughtTogetherModel.findOne({
          primaryId: cartItems[i].item,
          secondaryId: cartItems[j].item,
        });

        if (existingRecommendation) {
          await BoughtTogetherModel.findOneAndUpdate(
            {
              primaryId: cartItems[i].item,
              secondaryId: cartItems[j].item,
            },
            {
              $inc: { count: 1 },
            },
            { new: true }
          );
        } else {
          if (i !== j) {
            await BoughtTogetherModel.create({
              primaryId: cartItems[i].item,
              secondaryId: cartItems[j].item,
            });
          }
        }
      }
    }
  }

  res.status(201).json({ order, orderItemsFromCart, createPaymentRecived });
});

export {
  addPendingCryptoOder,
  getSinglePendingCryptoOrder,
  createOrderByCrpyto,
};
