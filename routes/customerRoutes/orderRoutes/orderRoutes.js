// Imports
import { customerCreatesOrder, getMyOrders, getMySingleOrder } from '#controllers/orderControllers/orderController.js';
import { Router } from 'express';

const orderRoutes = Router();

orderRoutes.route('/').get(getMyOrders).post(customerCreatesOrder)
// orderRoutes.route('/createOrder').post(customerCreatesOrder)
// orderRoutes.route('/createOrder',customerCreatesOrder)
orderRoutes.route('/:id').get(getMySingleOrder)

// Export 
export default orderRoutes;