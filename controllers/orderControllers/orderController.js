import asyncHandler from "express-async-handler";
// import Customer from "#models/userModels/customerModel/customerModel.js"
import Order from "../../models/orderModels/orderModel.js";
import OrderItem from "../../models/orderModels/orderItemsModel.js";
import BoughtTogether from "#models/productModel/boughtTogetherModel.js";
import Review from "#models/reviewModel/reviewModel.js";

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  const allOrders = await Order.find({ store: req.params.id });

  res.status(200).json(allOrders);
});

// Get All OrderItems From One Order
const getOrderItemsFromOrder = asyncHandler(async (req, res) => {
  const orderItems = await OrderItem.find({ order: req.params.id })
    .populate("item")
    .populate("size");

  res.status(200).json(orderItems);
});

//Get All Orders By Status
const getAllOrdersByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const orders = await Order.find({ orderStatus: status });
  res.status(200).json(orders);
});

// Get Single Customer Orders
const getSingleCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.params.id });

  res.status(200).json(orders);
});

// Get My Orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { orderStatus } = req.params;
  const myOrders = await Order.find({
    customer: req.customer._id,
    orderStatus: orderStatus,
  });
  console.log(myOrders);

  // Array to store all order items
  let allOrderItems = [];

  // For each order, find its associated order items
  for (const order of myOrders) {
    const orderItems = await OrderItem.find({ order: order._id })
      .populate("storeId")
      .populate("item");

    allOrderItems = allOrderItems.concat(orderItems);
  }

  res.status(200).json(allOrderItems);
});

const getMyOrdersByStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.params;

  console.log("API HIT", orderStatus);
  console.log(req.customer._id, orderStatus);

  const myOrders = await Order.find({
    customer: req.customer._id,
    orderStatus: orderStatus,
  })
    .populate("store")
    .sort({ createdAt: -1 });

  let allOrderItems = [];

  for (const order of myOrders) {
    const orderItems = await OrderItem.find({ order: order._id })
      .populate({
        path: "item", // Populate the item field
      })
      .populate({
        path: "order", // Populate the order field
      })
      .populate({
        path: "storeId", // Populate the storeId field
      })
      .populate({
        path: "size", // Populate the size field
        populate: {
          path: "size", // Populate the sized field inside size
        },
      });

    allOrderItems = allOrderItems.concat(orderItems);
  }

  console.log(allOrderItems);

  res.status(200).json(allOrderItems);
});


// Get My SingleOrders
const getMySingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("store");

  const orderItems = await OrderItem.find({ order: req.params.id }).populate(
    "item"
  );

  if (req.customer._id.toString() === order.customer.toString()) {
    res.status(200).json({ order, orderItems });
  } else {
    res.status(400);
    throw new Error("This Order Belongs To Another Customer");
  }
});
const getMySingleOrderItems = asyncHandler(async (req, res) => {
  const orderItems = await OrderItem.find({ order: req.params.id }).populate(
    "item"
  );
  res.status(200).json(orderItems);
});

const getAllOrderItems = asyncHandler(async (req, res) => {
  console.log("api hit");
  const id = req.customer._id;
  console.log(id);
  const orders = await Order.find({ customer: id });
  console.log(orders);

  let allOrderItems = [];

  for (const order of orders) {
    const orderItems = await OrderItem.find({ order: order._id }).populate(
      "item"
    );
    allOrderItems.push(orderItems);
  }

  res.status(200).json(allOrderItems);
});

const getMySingleOrderReviewByOrderId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const storeReview = await Review.findOne({ order: id });
  if (storeReview) {
    res.status(200).send(storeReview);
  } else {
    res.status(400);
    throw new Error("This Order have no review");
  }
});
// Create Order
const customerCreatesOrder = asyncHandler(async (req, res) => {
  const {
    address,
    purchasePrice,
    processingFee,
    authenticationFee,
    shippingFee,
    tax,
    discount,
    deliveryFee,
    subtotal,
    total,
    cartItems,
    store,
    // customer
  } = req.body;

  // console.log(cartItems);

  console.log("APi is hit");

  // const existingCustomer = await Customer.findById(customer)
  if (!req.customer) {
    res.status(401);
    throw new Error("Customer not found");
  }

  const order = await Order.create({
    address,
    purchasePrice,
    processingFee,
    authenticationFee,
    shippingFee,
    discount,
    tax,
    subtotal,
    deliveryFee,
    subtotal,
    total,
    store,
    customer: req.customer._id,
    // customer,
    orderStatus: "processing",

    // area,
    // areaString,
    // district,
    // division,
    // zipCode,
  });

  const orderItemsFromCart = cartItems.map(
    (i) => (i = { ...i, order: order._id })
  );
  const createdOrderItems = await OrderItem.insertMany(orderItemsFromCart);

  // Create Recommend Product

  console.log(order, createdOrderItems);
  res.status(200).json({ order, createdOrderItems });
  // res.redirect("http://localhost:3003/main/checkout/orderSuccesful")
});

const getSellerAllOrder = asyncHandler(async (req, res) => {
  const { store, orderStatus } = req.query;
  const query = { store, orderStatus };
  const orders = await Order.find(query)
    .populate("customer")
    .populate("store")
    .populate("address")
    .sort({ createdAt: -1 });

  res.status(200).json(orders);
});

// Get A Single Order
const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id })
    .populate("customer")
    .populate("store")
    .populate("address");

  res.status(200).json(order);
});

const getSingleItems = asyncHandler(async (req, res) => {
  const items = await OrderItem.findOne({ _id: req.params.id })
    .populate("item")
    .populate("size");

  res.status(200).json(items);
});

const getCustomerOrdersByStatus = asyncHandler(async (req, res) => {
  const { orderStatus, customerId } = req.params;
  const customerOrders = await Order.find({
    customer: customerId,
    orderStatus: orderStatus,
  })
    .populate("store")
    .populate("customer");
  res.status(200).json(customerOrders);
});

const customerOrderItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("id is ", id);
  const orderItems = await OrderItem.find({ order: id }).populate("item");
  console.log(orderItems);
  res.status(200).json(orderItems);
});

const totalOrderValue = asyncHandler(async (req, res) => {
  Order.aggregate([
    {
      $group: {
        _id: null,
        totalSum: { $sum: "$total" },
      },
    },
  ]).exec((err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error occurred while calculating total sum");
      return;
    }
    const roundedTotalSum = Math.round(result[0].totalSum); // Round the totalSum
    res.json({ totalSum: roundedTotalSum });
  });
});

export {
  customerCreatesOrder,
  getMyOrders,
  getAllOrders,
  getAllOrdersByStatus,
  getSingleOrder,
  getOrderItemsFromOrder,
  getSingleCustomerOrders,
  getMySingleOrder,
  getSellerAllOrder,
  getSingleItems,
  getMyOrdersByStatus,
  getCustomerOrdersByStatus,
  customerOrderItems,
  totalOrderValue,
  getMySingleOrderItems,
  getMySingleOrderReviewByOrderId,
  getAllOrderItems,
};
