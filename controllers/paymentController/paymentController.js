import Stripe from "stripe";
import asyncHandler from "express-async-handler";
import Order from "#models/orderModels/orderModel.js";
import OrderItem from "#models/orderModels/orderItemsModel.js";
import globals from "node-global-storage";
import PaymentRecieve from "#models/paymentRecivedModel/paymentRecivedModel.js";
import PaymentToSeller from "#models/paymentToSellerModel/paymentToSellerModel.js";
import Address from "#models/addressModel/addressModel.js";
import Customer from "#models/userModels/customerModel/customerModel.js";
import mongoose from "mongoose";
import { sendPaymentInfoEmail } from "#config/email/emailFormats/sendPaymentInfoEmail.js";
import BoughtTogetherModel from "#models/productModel/boughtTogetherModel.js";
import { orderEmailToSeller } from "../../config/email/emailFormats/orderEmailToSeller.js";
import Seller from "#models/userModels/sellerModel/sellerModel.js";
import SellerStoreProductSize from "#models/productModel/sellerStoreProductSizeModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { ResponseMessage } from "#controllers/utils/ResponseMessage.js";
import crypto from 'crypto';

const paymentIntent = asyncHandler(async (req, res) => {
  globals.unset("orderData");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const {
    address,
    // purchasePrice,
    // processingFee,
    // authenticationFee,
    shippingFee = 0,
    tax = 0,
    // discount,
    // deliveryFee,
    subtotal,
    total,
    cartItems,
    store,
    seller,
    selectedOption,
    pickupDate,
    pickupTime,
    carrierCharge,
    deliveryDays
  } = req.body;

  const orderData = {
    customer: req.customer._id,
    // address,
    // purchasePrice,
    // processingFee,
    // authenticationFee,
    shippingFee,
    tax,
    // discount,
    // deliveryFee,
    subtotal,
    total,
    cartItems,
    store,
    seller,
    selectedOption,
    pickupDate,
    pickupTime,
    carrierCharge,
    deliveryDays,
  };
  if (address) {
    orderData.address = address;
  }

  console.log("Order Data", orderData);

  globals.set("orderData", orderData);

  const customer = await stripe.customers.list({
    email: req.customer.email,
    limit: 1,
  });

  let customerId;

  if (customer.data.length > 0) {
    customerId = customer.data[0].id;
  } else {
    const newCustomer = await stripe.customers.create({
      name: req.customer.name,
      email: req.customer.email,
    });
    customerId = newCustomer.id;
  }

  let additionalCharges = 0;

  if (!isNaN(shippingFee)) {
    additionalCharges = Math.round(shippingFee + tax);
  } else {
    additionalCharges = tax;
  }

  // Calculate additional charge amount

  console.log(additionalCharges, "additionalCharges");
  //  console.log("Addditional charge is ",additionalCharges)

  // Set up line items including products and additional charge
  const lineItems = cartItems.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        // images: [product.cardImage],
      },
      unit_amount: Math.round(product.price * 100),
    },
    quantity: product.quantity,
  }));

  console.log(lineItems, "Line Items");
  // Add line item for additional charge
  if (additionalCharges > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",

        product_data: {
          name: "CheB Fee",
        },
        unit_amount: Math.round(additionalCharges * 100),
      },
      quantity: 1,
    });
  }

  console.log(customerId, "Customer ID");
  //  create checkout session
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   line_items: lineItems,
  //   mode: "payment",
  //   customer: customerId,
  //   payment_intent_data: {
  //     setup_future_usage: "on_session",
  //   },
  //   success_url: `${process.env.BACKEND_URL}/api/customers/payment-intent/createOrderByStripePayment?session_id={CHECKOUT_SESSION_ID}`,
  //   // // success_url: `http://localhost:5016/api/customers/payment-intent/createOrderByStripePayment?session_id={CHECKOUT_SESSION_ID}`,
  //   // // cancel_url: "http://localhost:3003/main/checkout/orderCancel",
  //   cancel_url: `${process.env.CONSUMER_APP_LINK}/main/checkout/orderCancel`,
  //   // // total: totalPrice,
  // });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],  
      // crypto
      line_items: lineItems,
      mode: "payment",
      customer: customerId,
      automatic_tax: {
        enabled: true,
      },

      customer_update: {
        shipping: "auto",
      },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      payment_intent_data: {
        setup_future_usage: "on_session",
      },
      success_url: `${process.env.BACKEND_URL}/api/customers/payment-intent/createOrderByStripePayment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CONSUMER_APP_LINK}/main/checkout/orderCancel`,
    });

    // console.log("Session created:", session);
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }

  console.log(session, "Session");

  res.json({ id: session.id });
});

// const calculate_tax = async (orderAmount, currency) => {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//   try {
//     const taxCalculation = await stripe.tax.calculations.create({
//       currency,
//       customer_details: {
//         address: {
//           city: 'NY',
//           postal_code: '10002',
//           country: 'US',
//         },
//         address_source: 'shipping',
//       },
//       line_items: [
//         {
//           product: 'prod_Qm5hv0bStMUofS',
//           amount: orderAmount,
//           reference: 'ProductRef',
//           tax_behavior: 'exclusive',
//         },
//       ],
//     });
//     console.log('Tax Calculation Response:', taxCalculation);
//     return taxCalculation;
//   } catch (error) {
//     console.error('Error in tax calculation:', error);
//     throw error;
//   }
// };

// const createPaymentIntent = asyncHandler(async (req, res) => {
//   const { totalAmount } = req.body;
//   console.log(req.customer, 'Customer');
//   const amountInCents = Math.round(totalAmount * 100);

//   try {
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//     const customerList = await stripe.customers.list({
//       email: req.customer.email,
//       limit: 1,
//     });

//     console.log(customerList, 'customer list');

//     let customerId;
//     if (customerList.data.length > 0) {
//       customerId = customerList.data[0].id;
//       console.log(customerId, 'customer id if exists');
//     } else {
//       const newCustomer = await stripe.customers.create({
//         name: req.customer.name,
//         email: req.customer.email,
//       });
//       console.log(newCustomer, 'new customer');
//       customerId = newCustomer.id;
//     }
//     console.log(customerId, 'customer id');
//     let taxCalculation = await calculate_tax(amountInCents, 'usd');
//     if (taxCalculation && taxCalculation.tax_amount_inclusive > 0) {
//       console.log('Tax Amount:', taxCalculation.tax_amount_inclusive);
//     } else {
//       console.log('Tax amount not available or zero.');
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: taxCalculation.tax_amount_inclusive || amountInCents, // Use the tax-inclusive amount or fallback to original
//       currency: 'usd',
//       customer: customerId,
//       setup_future_usage: 'off_session',
//       payment_method_types: ['card'],
//       receipt_email: req.customer.email,
//       metadata: {
//         customerId: customerId,
//         orderId: 'TEMP_ORDER_ID',
//         tax_calculation: taxCalculation.id,
//       },
//     });

//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { totalAmount } = req.body;
  const amountInCents = Math.round(totalAmount * 100);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const customerList = await stripe.customers.list({
      email: req.customer.email,
      limit: 1,
    });

    let customerId;
    if (customerList.data.length > 0) {
      customerId = customerList.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        name: req.customer.name,
        email: req.customer.email,
      });
      customerId = newCustomer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Use the tax-inclusive amount or fallback to original
      currency: "usd",
      customer: customerId,
      setup_future_usage: "off_session",
      payment_method_types: ["card","crypto"],
      receipt_email: req.customer.email,
      metadata: {
        customerId: customerId,
        orderId: "TEMP_ORDER_ID",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const createMobileOrder = asyncHandler(async (req, res) => {
  try {
    console.log("Step 1: Extracting data from request body", req.body);
    const customer = req.customer._id;
    const {
      address,
      shippingFee,
      tax,
      subtotal,
      total,
      cartItems,
      store,
      pickupType,
      pickupDate,
      pickupTime,
    } = req.body;

    const { seller } = await SellerStore.findOne({
      _id: store,
    });

    console.log("check", seller);

    console.log("Step 2: Preparing new order data");
    const newOrderData = {
      shippingFee,
      tax,
      subtotal,
      total,
      store,
      customer,
      orderStatus: "processing",
      paymentMethod: "Not Specified", // or specify if needed, e.g., "Cash on Delivery"
      pickupType,
      pickupDate,
      pickupTime,
    };

    if (address) {
      console.log("Step 2a: Address provided, adding to order data");
      newOrderData.address = address;
    }

    console.log("Step 3: Creating the order");
    const order = await Order.create(newOrderData);
    console.log("Order created:", order);

    const orderItemsFromCart = cartItems.map((item) => ({
      ...item,
      order: order._id,
    }));
    const createdOrderItems = await OrderItem.insertMany(orderItemsFromCart);
    console.log("Order items created:", createdOrderItems);

    console.log("Step 5: Creating payment record");
    const createPaymentRecieve = await PaymentRecieve.create({
      order: order._id,
      amount: subtotal,
      store: store,
      seller: seller,
      transactionId: "Not Specified", // or specify if needed
    });
    console.log("Payment record created:", createPaymentRecieve);

    console.log("Step 6: Updating stock for ordered items");
    createdOrderItems.forEach(async (orderItem) => {
      console.log(`Updating stock for item size: ${orderItem.size}`);
      await SellerStoreProductSize.findByIdAndUpdate(orderItem.size, {
        $inc: { stock: -orderItem.quantity },
      });
    });

    console.log("Step 7: Fetching customer and store information for email");
    const customerInfo = await Customer.findById(customer);
    const customerAddress = await Address.findById(address);
    const storeInfo = await SellerStore.findById(store);
    console.log("Customer info:", customerInfo);
    console.log("Customer address:", customerAddress);
    console.log("Store info:", storeInfo);

    console.log("Step 8: Sending payment info email to customer");
    await sendPaymentInfoEmail(customerInfo.email, customerInfo, cartItems, {
      shippingFee,
      tax,
      orderId: order._id,
      paymentMethod: order.paymentMethod,
      orderDate: order.createdAt,
      customerAddress,
      pickupDate,
      pickupTime,
      pickupType,
      storeInfo,
      total: order.total,
    });

    console.log("Step 9: Sending order email to seller");

    // console.log("newOrderData", newOrderData.subtotal);
    const singleSeller = await Seller.findById(seller);
    await orderEmailToSeller(
      singleSeller.email,
      cartItems,
      customerInfo,
      customerAddress,
      pickupDate,
      pickupTime,
      pickupType,
      storeInfo,
      subtotal
    );

    console.log("Step 10: Creating bought together recommendations");
    if (cartItems.length > 1) {
      for (let i = 0; i < cartItems.length; i++) {
        for (let j = 0; j < cartItems.length; j++) {
          if (i !== j) {
            console.log(
              `Checking recommendation for items: ${cartItems[i].item} and ${cartItems[j].item}`
            );
            const existingRecommendation = await BoughtTogetherModel.findOne({
              primaryId: cartItems[i].item,
              secondaryId: cartItems[j].item,
            });

            if (existingRecommendation) {
              console.log("Existing recommendation found, updating count");
              await BoughtTogetherModel.findOneAndUpdate(
                {
                  primaryId: cartItems[i].item,
                  secondaryId: cartItems[j].item,
                },
                { $inc: { count: 1 } },
                { new: true }
              );
            } else {
              console.log("No recommendation found, creating new one");
              await BoughtTogetherModel.create({
                primaryId: cartItems[i].item,
                secondaryId: cartItems[j].item,
              });
            }
          }
        }
      }
    }

    console.log("Step 11: Sending response");
    res.status(201).json({
      message: "Order created successfully",
      order,
      orderItems: createdOrderItems,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the order", error });
  }
});

// Create Order
const createOrderByStripePayment = asyncHandler(async (req, res) => {
  try {
    console.log("Step 1: Fetching customer and seller information", req.que);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { session_id } = req.query;

    // Fetch the session object from Stripe using session ID
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Extract transaction ID from the session object
    const paymentIntentId = session.payment_intent;

    // Retrieve the payment intent object from Stripe using paymentIntentId
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Extract transaction ID from payment intent object
    const transactionId = paymentIntent.id;

    // Now you have the transaction ID, you can use it for further processing
    // console.log("Transaction ID:", transactionId);

    const orderData = globals.get("orderData");
    const {
      // purchasePrice,
      // processingFee,
      // authenticationFee,
      shippingFee,
      tax,
      // discount,
      // deliveryFee,
      subtotal,
      total,
      cartItems,
      store,
      customer,
      seller,
      selectedOption,
      pickupDate,
      pickupTime,
    } = orderData;

    console.log("calling createOrderByStripePayment", orderData);

    const newOderData = {
      // purchasePrice,
      // processingFee,
      // authenticationFee,
      shippingFee,
      // discount,
      tax,
      // subtotal,
      // deliveryFee,
      subtotal,
      total,
      store,
      customer,
      orderStatus: "processing",
      paymentMethod: "Stripe",
      pickupType: selectedOption,
      pickupDate,
      pickupTime,
    };
    if (orderData.address) {
      newOderData.address = orderData.address;
    }

    const order = await Order.create(newOderData);

    const orderItemsFromCart = cartItems.map(
      (i) => (i = { ...i, order: order._id })
    );
    const createdOrderItems = await OrderItem.insertMany(orderItemsFromCart);

    // console.log("cart Items", cartItems);
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

    // console.log("customerInfo" , customerInfo)

    const customerAddress = await Address.findOne({ _id: orderData?.address });
    // let findCustomerInfo = await Customer.findOne({
    //   _id: customerAddress?.customer,
    // });
    const storeInfo = await SellerStore.findOne({ _id: store });

    // //Shipping Create By EasyPost
    // let totalHeight = 0;
    // let totalWeight = 0;
    // let totalLength = 0;
    // let totalWidth = 0;

    // orderData.cartItems.forEach((cartItem) => {
    //   totalHeight += cartItem.sizeData.height || 0;
    //   totalWeight += cartItem.sizeData.weight || 0;
    //   totalLength += cartItem.sizeData.length || 0;
    //   totalWidth += cartItem.sizeData.width || 0;
    // });

    // if (orderData.address) {

    //   // Shipment data configuration
    //   const shipmentData = JSON.stringify({
    //     shipment: {
    //       to_address: {
    //         name: findCustomerInfo?.name,
    //         street1: customerAddress.street,
    //         city: customerAddress.city,
    //         state: customerAddress.state,
    //         zip: customerAddress.zipCode,
    //         email: findCustomerInfo?.email,
    //       },
    //       from_address: {
    //         name: "EasyPost",
    //         street1: storeInfo?.street,
    //         street2: storeInfo?.street2,
    //         city: storeInfo?.city,
    //         state: storeInfo?.state,
    //         zip: storeInfo?.zipCode,
    //         phone: storeInfo?.mobile,
    //         email: storeInfo?.email,
    //       },
    //       parcel: {
    //         length: totalLength,
    //         width: totalWidth,
    //         height: totalHeight,
    //         weight: totalWeight,
    //       },
    //     },
    //   });

    //   // Common Axios configuration
    //   const axiosConfig = {
    //     method: "post",
    //     maxBodyLength: Infinity,
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${process.env.EASY_POST_API_KEY}`,
    //     },
    //   };

    //   const shipmentResponse = await axios.request({
    //     ...axiosConfig,
    //     url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/shipments`,
    //     data: shipmentData,
    //   });

      if (orderData.carrierCharge) {
        await Order.findByIdAndUpdate(order._id, {
          shipmentResponse:orderData.carrierCharge
          // shipmentId: orderData.carrierCharge.shipment_id,
          // carrier: orderData.carrierCharge.carrier
        });
        console.log(
          "EasyPost shipment created with ID:",
          orderData.carrierCharge
        );
      }

    //   //getting tracking_code by shipmentId

    //   const rateId = JSON.stringify({
    //     "rate": {
    //       "id": shipmentResponse.data.rates[0].id
    //     }
    //   })

    //   const trackingCodeResponse = await axios.request({
    //     ...axiosConfig,
    //     url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/shipments/${shipmentResponse.data.id}/buy`,
    //     data: rateId,
    //   });

    //   // console.log("trackingCodeResponse", trackingCodeResponse)

    //   if (trackingCodeResponse.data) {
    //     await Order.findByIdAndUpdate(order._id, {
    //       // trackingCodeResponse.data.tracking_code
    //       trackingCode: "EZ1000000001",
    //     });
    //     console.log(
    //       "EasyPost tracking code get:",
    //       trackingCodeResponse.data.tracking_code
    //     );
    //   }



    //   // Tracking data configuration
    //   const trackingData = JSON.stringify({
    //     tracker: {
    //       // trackingCodeResponse.data.tracking_code
    //       tracking_code: "EZ1000000001",
    //       carrier: shipmentResponse.data.rates[0].carrier,
    //     },
    //   });

    //   // Tracking creation request
    //   const trackingResponse = await axios.request({
    //     ...axiosConfig,
    //     url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/trackers`,
    //     data: trackingData,
    //   });

    //   if (trackingResponse.data) {
    //     await Order.findByIdAndUpdate(order._id, {
    //       trackingId: trackingResponse.data.id,
    //       trackingUrl: trackingResponse.data.public_url,
    //       // trackingResponse.data.tracking_code,
    //       trackingCode: "EZ1000000001"
    //     });
    //     console.log(
    //       "EasyPost tracking created with ID:",
    //       trackingResponse.data.id
    //     );
    //   }

    // }

    await sendPaymentInfoEmail(customerInfo?.email, customerInfo, cartItems, {
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
      selectedOption,
      storeInfo,
    });

    const singleSeller = await Seller.findById(cartItems[0].seller);

    await orderEmailToSeller(
      singleSeller.email,
      cartItems,
      customerInfo,
      customerAddress,
      pickupDate,
      pickupTime,
      selectedOption,
      storeInfo,
      subtotal
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

    res.redirect(
      `${process.env.CONSUMER_APP_LINK}/main/checkout/orderSuccesful`
    );
  } catch (error) {
    console.error(error,"easypost error");
    res.status(500).json({ message: error });
  }
});




async function createShipment(orderData, findCustomerInfo, customerAddress, storeInfo, order, axiosConfig) {
  // Initialize total parcel dimensions and weight
  let totalHeight = 0;
  let totalWeight = 0;
  let totalLength = 0;
  let totalWidth = 0;

  // Calculate total dimensions and weight from cart items
  orderData.cartItems.forEach((cartItem) => {
    totalHeight += cartItem.sizeData.height || 0;
    totalWeight += cartItem.sizeData.weight || 0;
    totalLength += cartItem.sizeData.length || 0;
    totalWidth += cartItem.sizeData.width || 0;
  });

  // Shipment data configuration
  const shipmentData = JSON.stringify({
    shipment: {
      to_address: {
        name: findCustomerInfo?.name,
        street1: customerAddress.street,
        city: customerAddress.city,
        state: customerAddress.state,
        zip: customerAddress.zipCode,
        email: findCustomerInfo?.email,
      },
      from_address: {
        name: "EasyPost",
        street1: storeInfo?.street,
        street2: storeInfo?.street2,
        city: storeInfo?.city,
        state: storeInfo?.state,
        zip: storeInfo?.zipCode,
        phone: storeInfo?.mobile,
        email: storeInfo?.email,
      },
      parcel: {
        length: totalLength,
        width: totalWidth,
        height: totalHeight,
        weight: totalWeight,
      },
    },
  });

  try {
    // Send shipment creation request to EasyPost
    const shipmentResponse = await axios.request({
      ...axiosConfig,
      url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/shipments`,
      data: shipmentData,
    });

    // If shipment is successfully created, update the order with shipment ID
    if (shipmentResponse.data) {
      await Order.findByIdAndUpdate(order._id, {
        shipmentId: shipmentResponse.data.id,
      });
      console.log("EasyPost shipment created with ID:", shipmentResponse.data.id);
    }
    return shipmentResponse.data
  } catch (error) {
    console.error("Error creating EasyPost shipment:", error);
  }
}


async function createShipmentTracking(rateIds, orderId, axiosConfig, shippingId, carrier) {
  try {
    const rateId = JSON.stringify({
      rate: {
        id: rateIds,
      },
    });

    const trackingCodeResponse = await axios.request({
      ...axiosConfig,
      url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/shipments/${shippingId}/buy`,
      data: rateId,
    });

    // Update order with tracking code if available
    if (trackingCodeResponse.data) {
      // const trackingCode = trackingCodeResponse.data.tracking_code || "EZ2000000002"; // Default for testing
      const trackingCode = "EZ7000000007"; // Default for testing
      await Order.findByIdAndUpdate(orderId, {
        trackingCode,
      });

      // Tracking data configuration
      const trackingData = JSON.stringify({
        tracker: {
          tracking_code: trackingCode,
          carrier: carrier,
        },
      });


      // Tracking creation request
      const trackingResponse = await axios.request({
        ...axiosConfig,
        url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/trackers`,
        data: trackingData,
      });

      if (trackingResponse.data) {
        // Update order with tracker ID and URL
        await Order.findByIdAndUpdate(orderId, {
          trackingId: trackingResponse.data.id,
          trackingUrl: trackingResponse.data.public_url,
        });
        console.log("EasyPost tracking created with ID:", trackingResponse.data.id);
      }
    }
  } catch (error) {
    console.error("Error creating shipment tracking:", error);
  }
}





const createOrderByCrpyto = asyncHandler(async (req, res) => {

  try {
    let {
      address,
      // purchasePrice,
      // processingFee,
      // authenticationFee,
      shippingFee,
      tax,
      discount,
      // deliveryFee,
      subtotal,
      total,
      cartItems,
      store,
      seller,
      transactionId,
      selectedOption,
      pickupDate,
      pickupTime,
      createOrderHash
    } = req.body;

    let newOderData = {
      // purchasePrice,
      // processingFee,
      // authenticationFee,
      shippingFee,
      // discount,
      tax,
      // deliveryFee,
      subtotal,
      total,
      store,
      customer: req.customer._id,
      orderStatus: "processing",
      paymentMethod: "Crypto",
      pickupType: selectedOption,
      pickupDate,
      pickupTime,
      transactionHash: createOrderHash
    };
    if (address) {
      newOderData.address = address;
    }

    const order = await Order.create(newOderData);

    const orderItemsFromCart = cartItems.map(
      (i) => (i = { ...i, order: order._id })
    );
    const createdOrderItems = await OrderItem.insertMany(orderItemsFromCart);

    const createPaymentRecived = await PaymentRecieve.create({
      order: order._id,
      amount: subtotal,
      store: store,
      seller: seller,
      transactionId: transactionId,
      transactionHash: createOrderHash
    });

    createdOrderItems.forEach(async (orderItem) => {
      await SellerStoreProductSize.findByIdAndUpdate(orderItem.size, {
        $inc: { stock: -orderItem.quantity },
      });
    });
    const customerInfo = await Customer.findOne({ _id: req.customer._id });

    let customerAddress;
    if (address) {
      customerAddress = await Address.findOne({ _id: address });
    }

    //Easy Post 
    let findCustomerInfo = await Customer.findOne({
      _id: customerAddress?.customer,
    });

    const storeInfo = await SellerStore.findOne({ _id: store });



    // Common Axios configuration
    const axiosConfig = {
      method: "post",
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EASY_POST_API_KEY}`,
      },
    };



    let shippingResponse = await createShipment(req.body, findCustomerInfo, customerAddress, storeInfo, order?._id, axiosConfig);

    createShipmentTracking(await shippingResponse.rates[0].id, order?._id, axiosConfig, await shippingResponse.id, await shippingResponse.rates[0].carrier)

    // sendPaymentInfoEmail(customerInfo?.email, customerInfo, cartItems, {
    //   // processingFee,
    //   shippingFee,
    //   // authenticationFee,
    //   tax,
    //   // discount,
    //   orderId: order?._id,
    //   paymentMethod: order.paymentMethod,
    //   orderDate: order.createdAt,
    //   customerAddress,
    //   pickupDate,
    //   pickupTime,
    //   pickupType: selectedOption,
    //   total,
    // });

    const singleSeller = await Seller.findById(cartItems[0].seller);

    await orderEmailToSeller(
      singleSeller.email,
      cartItems,
      customerInfo,
      customerAddress,
      pickupDate,
      pickupTime,
      selectedOption,
      (subtotal = newOderData?.subtotal)
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

  } catch (error) {
    console.log("error", error)

  }


});

const getCustomerStripeId = asyncHandler(async (req, res) => {
  console.log("Customer", req.customer);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const customer = await stripe.customers.list({
    email: req.customer.email,
    limit: 1,
  });

  let customerId;

  if (customer.data.length > 0) {
    customerId = customer.data[0].id;
  } else {
    return res.status(404).json({ message: "Customer not found" });
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  res.json({ payment_methods: paymentMethods.data });
});

const dispatchStripeSaveCard = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentMethod = await stripe.paymentMethods.detach(id);
  console.log(paymentMethod);
  res.status(200).json(paymentMethod);
});

// for admin
const getSellerTotalOrderSum = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const sum = await PaymentRecieve.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    if (!sum.length) {
      return res.status(200).json({ totalAmount: 0 });
    }

    const { totalAmount } = sum[0];
    const roundedTotalAmount = Math.round(totalAmount); // Round the total amount

    res.status(200).json({ totalAmount: roundedTotalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sum" });
  }
});

const getSingleSellerTotalPaidPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const sum = await PaymentToSeller.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    if (!sum.length) {
      return res.status(200).json({ totalAmount: 0 });
    }

    const { totalAmount } = sum[0];
    const roundedTotalAmount = Math.round(totalAmount); // Round the total amount

    res.status(200).json({ totalAmount: roundedTotalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sum" });
  }
});

// for seller
const singleSellerTotalOrderValue = asyncHandler(async (req, res) => {
  const id = req.seller._id;

  try {
    const sum = await PaymentRecieve.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    if (!sum.length) {
      return res.status(200).json({ totalAmount: 0 });
    }

    const { totalAmount } = sum[0];
    const roundedTotalAmount = Math.round(totalAmount); // Round the total amount

    res.status(200).json({ totalAmount: roundedTotalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sum" });
  }
});

const singleSellerTotalPaidValue = asyncHandler(async (req, res) => {
  const id = req.seller._id;

  try {
    const sum = await PaymentToSeller.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    if (!sum.length) {
      return res.status(200).json({ totalAmount: 0 });
    }

    const { totalAmount } = sum[0];
    const roundedTotalAmount = Math.round(totalAmount); // Round the total amount

    res.status(200).json({ totalAmount: roundedTotalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sum" });
  }
});

export const createOrderHash = asyncHandler(async (req, res) => {
  try {
    let { productId } = req.body;
    const timestamp = Date.now().toString();
    const data = productId + timestamp;

    // Create SHA-256 hash
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return res.status(StatusCodes.OK).json({
      data: hash,
    });

  } catch (err) {
    console.log("err", err)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: err.message,
    });
  }

});

export {
  paymentIntent,
  createOrderByStripePayment,
  getCustomerStripeId,
  dispatchStripeSaveCard,
  getSellerTotalOrderSum,
  getSingleSellerTotalPaidPayment,
  singleSellerTotalOrderValue,
  singleSellerTotalPaidValue,
  createPaymentIntent,
  createOrderByCrpyto,
  createMobileOrder,
};
