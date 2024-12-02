import fs from 'fs'
import asyncHandler from 'express-async-handler';
import OrderStatus from '../../models/orderModels/orderStatusModel.js';
import Order from '../../models/orderModels/orderModel.js'
import OrderItem from '../../models/orderModels/orderItemsModel.js'
import SellerStoreProductSize from '../../models/productModel/sellerStoreProductSizeModel.js'
import axios from 'axios';


const createTracking = async (order) => {
    try {
        console.log("order12",order)
      // Buy the shipment using the rate ID to get the tracking code
      const rateId = JSON.stringify({
        rate: { id: order?.shipmentResponse?.id },
      });

      // Common Axios configuration
      const axiosConfig = {
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EASY_POST_API_KEY}`,
        },
      };
  
      const trackingCodeResponse = await axios.request({
        ...axiosConfig,
        url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/shipments/${order.shipmentResponse.shipment_id}/buy`,
        data: rateId,
      });

      console.log("trackingCodeResponse",trackingCodeResponse);
  
      // Update order with the tracking code
      if (trackingCodeResponse.data) {
        const trackingCode = "EZ1000000001"
        //  trackingCodeResponse.data.tracking_code || ; 
        await Order.findByIdAndUpdate(order._id, { trackingCode });
  
        console.log("EasyPost tracking code retrieved:", trackingCode);
  
        // Create tracking data
        const trackingData = JSON.stringify({
          tracker: {
            tracking_code: trackingCode,
            carrier: order?.shipmentResponse?.carrier,
          },
        });
  
        const trackingResponse = await axios.request({
          ...axiosConfig,
          url: `${process.env.EASY_POST_BASE_URL}/${process.env.EASY_POST_API_VERSION}/trackers`,
          data: trackingData,
        });
  
        // Update order with tracking ID and URL
        if (trackingResponse.data) {
          await Order.findByIdAndUpdate(order._id, {
            trackingId: trackingResponse.data.id,
            trackingUrl: trackingResponse.data.public_url,
          });
  
          console.log("EasyPost tracking created with ID:", trackingResponse.data.id);
        }
      }
    } catch (error) {
      console.error("Error creating tracking data:", error.message);
    }
  };
  


const toBeDeliveredFromProcessing = asyncHandler( async (req, res) => {

    const {id} = req.params
    const order = await Order.findById(id)
    if(order.orderStatus !== "processing") {
        res.status(400);
        throw new Error('Order Status Is Not Processing!')
    }
    console.log("80cllinhg")
    await createTracking(order);
    const updatedOrder = await Order.findByIdAndUpdate(id, {orderStatus: "toBeDelivered"})

    res.status(200).json(updatedOrder);
    
})

const shippedFromToBeDelivered = asyncHandler( async (req, res) => {

    const {id} = req.params
     console.log("calling");
    const order = await Order.findById(id)
    if(order.orderStatus !== "toBeDelivered") {
        res.status(400);
        throw new Error('Order Status Is Not ToBeDelivered!')
    }
    const updatedOrder = await Order.findByIdAndUpdate(id, {orderStatus: "shipped"})

    res.status(200).json(updatedOrder);
    
})

const completedFromShipped = asyncHandler( async (req, res) => {

    const {id} = req.params

    const order = await Order.findById(id)
    if(order.orderStatus !== "shipped") {
        res.status(400);
        throw new Error('Order Status Is Not Shipped!')
    }
    const updatedOrder = await Order.findByIdAndUpdate(id, {orderStatus: "completed"})

    res.status(200).json(updatedOrder)
    
})

const canceledOrder = asyncHandler( async (req, res) => {

    const {id} = req.params

    const order = await Order.findById(id)
    if(order.orderStatus === "canceled") {
        res.status(400);
        throw new Error('Order Status Already Canceled!')
    }
    const updatedOrder = await Order.findByIdAndUpdate(id, {orderStatus: "canceled"})
    const orderItems = await OrderItem.find({ order: id })

    orderItems.forEach(async (orderItem) => {
        await SellerStoreProductSize.findByIdAndUpdate(orderItem.size, {
            $inc: { stock: orderItem.quantity },
        });   
    });
    res.status(200).json(updatedOrder)
    
})

const getOrderStatuses = asyncHandler( async (req, res) => {

    const OrderStatuses = await OrderStatus.find()
    res.status(200).json(OrderStatuses)
    
})

const setOrderStatus = asyncHandler( async (req, res) => {

    const {employee, order, status} = req.body;

    if (!employee || !order || !status) {
        res.status(400);
        throw new Error('Please add all fields!')
    }
    
    const orderStatus = await OrderStatus.create({
        employee,
        order,
        status
    })

    res.status(200).json(orderStatus)

})

const updateOrderStatus = asyncHandler( async (req, res) => {
    const { id } = req.params
    const orderStatusToUpdate = await OrderStatus.findById(id)

    if(!orderStatusToUpdate){
        res.status(400)
        throw new Error('OrderStatus not Found')
    }

    await OrderStatus.findByIdAndUpdate(id, {
        ...req.body
    })

    const updatedOrderStatus = await OrderStatus.findById(id)

    res.status(200).json(updatedOrderStatus)


})

const deleteOrderStatus = asyncHandler( async (req, res) => {

    const OrderStatus = await OrderStatus.findById(req.params.id)

    if (!OrderStatus) {
        res.status(400)
        throw new Error('OrderStatus not Found')
    }

    await OrderStatus.remove()

    res.status(200).json({id: req.params.id})

})

export {
    getOrderStatuses,
    setOrderStatus,
    updateOrderStatus,
    deleteOrderStatus,
    toBeDeliveredFromProcessing,
    shippedFromToBeDelivered,
    completedFromShipped,
    canceledOrder

}