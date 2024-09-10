import fs from 'fs'
import asyncHandler from 'express-async-handler';
import OrderStatus from '../../models/orderModels/orderStatusModel.js';
import Order from '../../models/orderModels/orderModel.js'
import OrderItem from '../../models/orderModels/orderItemsModel.js'
import SellerStoreProductSize from '../../models/productModel/sellerStoreProductSizeModel.js'
const toBeDeliveredFromProcessing = asyncHandler( async (req, res) => {

    const {id} = req.params

    const order = await Order.findById(id)
    if(order.orderStatus !== "processing") {
        res.status(400);
        throw new Error('Order Status Is Not Processing!')
    }
    const updatedOrder = await Order.findByIdAndUpdate(id, {orderStatus: "toBeDelivered"})

    res.status(200).json(updatedOrder)
    
})

const shippedFromToBeDelivered = asyncHandler( async (req, res) => {

    const {id} = req.params

    const order = await Order.findById(id)
    if(order.orderStatus !== "toBeDelivered") {
        res.status(400);
        throw new Error('Order Status Is Not ToBeDelivered!')
    }
    const updatedOrder = await Order.findByIdAndUpdate(id, {orderStatus: "shipped"})

    res.status(200).json(updatedOrder)
    
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