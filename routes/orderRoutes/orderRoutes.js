import { Router } from "express"

import { protectForCustomer, protectForEmployee } from "#middlewares/authMiddleware.js"
import { customerCreatesOrder, getAllOrders, getAllOrdersByStatus, getMyOrders, getMySingleOrder, getOrderItemsFromOrder, getSingleCustomerOrders, getSingleOrder } from "#controllers/orderControllers/orderController.js"
import { canceledOrder, completedFromShipped, shippedFromToBeDelivered, toBeDeliveredFromProcessing } from "#controllers/orderControllers/orderStatusController.js"

const router = Router()


router.route('/getAllOrders').get(protectForEmployee, getAllOrders)
router.route('/getSingleCustomerOrders/:id').get(protectForEmployee, getSingleCustomerOrders)
router.route('/getSingleOrder/:id').get(protectForEmployee, getSingleOrder)
router.route('/orderItemsFromOrder/:id').get(protectForEmployee, getOrderItemsFromOrder)
router.route('/allOrdersByStatus/:status').get(protectForEmployee, getAllOrdersByStatus);
router.route('/getMyOrders').get(protectForCustomer, getMyOrders)
router.route('/customerCreatesOrder').post(protectForCustomer, customerCreatesOrder)
router.route('/getMySingleOrder/:id').get(protectForCustomer, getMySingleOrder)


router.route('/toBeDeliveredFromProcessing/:id').patch(protectForEmployee, toBeDeliveredFromProcessing)
router.route('/shippedFromToBeDelivered/:id').patch(protectForEmployee, shippedFromToBeDelivered)
router.route('/completedFromShipped/:id').patch(protectForEmployee, completedFromShipped)
router.route('/canceledOrder/:id').patch(protectForEmployee, canceledOrder)


export default router