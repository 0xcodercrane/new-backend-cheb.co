// Imports
import { Router } from 'express'
import {  loginSeller, registerSeller, verifySeller } from '#controllers/userControllers/sellerControllers/sellerController.js';
import { forgotSellerPassword, resetSellerPassword } from '#controllers/userControllers/sellerControllers/sellerPasswordController.js';


const sellerAuthRoutes = Router()

// // Routes
sellerAuthRoutes.post('/register', registerSeller)
sellerAuthRoutes.post('/login', loginSeller)
sellerAuthRoutes.patch('/verify/:token', verifySeller);
sellerAuthRoutes.post('/forgotSellerPassword', forgotSellerPassword)
sellerAuthRoutes.patch('/resetSellerPassword', resetSellerPassword)

// Export
export default sellerAuthRoutes;