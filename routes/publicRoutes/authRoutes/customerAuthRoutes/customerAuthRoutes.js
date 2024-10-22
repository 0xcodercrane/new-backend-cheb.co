// Imports
import { Router } from 'express'
import { forgetCustomerPassword, loginCustomer, registerCustomer, resendCustomerOtp, resetCustomerPassword, verifyCustomer, verifyCustomerOtp } from '../../../../controllers/userControllers/customerControllers/customerControlller.js';



const customerAuthRoutes = Router()

// Routes
customerAuthRoutes.post('/login', loginCustomer)
customerAuthRoutes.post('/register', registerCustomer)
customerAuthRoutes.post('/verify-otp', verifyCustomerOtp)
customerAuthRoutes.post('/resend-otp', resendCustomerOtp)
customerAuthRoutes.patch('/verify/:token', verifyCustomer);
customerAuthRoutes.post('/forgotcustomerPassword', forgetCustomerPassword)
customerAuthRoutes.patch('/resetcustomerPassword', resetCustomerPassword)


// Export
export default customerAuthRoutes;