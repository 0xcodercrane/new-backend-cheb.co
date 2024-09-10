
import { getAllOrders, getOrderItemsFromOrder, getSellerAllOrder, getSingleItems, getSingleOrder } from '#controllers/orderControllers/orderController.js'
import { canceledOrder, completedFromShipped, shippedFromToBeDelivered, toBeDeliveredFromProcessing } from '#controllers/orderControllers/orderStatusController.js'
import {Router} from 'express'

const orderRoutes = Router()


orderRoutes.route("/").get(getSellerAllOrder)
orderRoutes.route("/getAllOrders/:id").get(getAllOrders)
orderRoutes.route("/:id").get(getSingleOrder)
orderRoutes.route("/items/:id").get(getOrderItemsFromOrder)
orderRoutes.route("/singleItem/:id").get(getSingleItems)



orderRoutes.route('/toBeDeliveredFromProcessing/:id').patch( toBeDeliveredFromProcessing)
orderRoutes.route('/shippedFromToBeDelivered/:id').patch( shippedFromToBeDelivered)
orderRoutes.route('/completedFromShipped/:id').patch( completedFromShipped)
orderRoutes.route('/canceledOrder/:id').patch( canceledOrder)

export default orderRoutes