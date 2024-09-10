import { getSingleCustomer } from "#controllers/userControllers/customerControllers/customerControlller.js";
import { getAllCustomers, totalCustomers } from "#controllers/userControllers/employeeControllers/employeeController.js";

import { Router } from "express"
import customerAddressRoutes from "./customerAddressRoutes.js";
import { customerOrderItems, getCustomerOrdersByStatus } from "#controllers/orderControllers/orderController.js";

const customerRoutes = Router()

// customers

customerRoutes.route("/").get(getAllCustomers)
customerRoutes.route("/:id").get(getSingleCustomer)
customerRoutes.route('/getCustomerOrders/:customerId/:orderStatus').get(getCustomerOrdersByStatus)
customerRoutes.route('/orderItems/:id').get(customerOrderItems)
customerRoutes.route('/totalCustomers').get(totalCustomers)


customerRoutes.use("/address",customerAddressRoutes)

export default customerRoutes;