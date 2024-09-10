// Imports
import { Router } from 'express'
import { forgetCustomerPassword, loginCustomer, registerCustomer, resetCustomerPassword, verifyCustomer } from '../../../../controllers/userControllers/customerControllers/customerControlller.js';



const customerAuthRoutes = Router()

// Routes
customerAuthRoutes.post('/login', loginCustomer)
customerAuthRoutes.post('/register', registerCustomer)
customerAuthRoutes.patch('/verify/:token', verifyCustomer);
customerAuthRoutes.post('/forgotcustomerPassword', forgetCustomerPassword)
customerAuthRoutes.patch('/resetcustomerPassword', resetCustomerPassword)


// Export
export default customerAuthRoutes;