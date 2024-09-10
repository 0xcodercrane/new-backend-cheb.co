
import { singleSellerTotalOrderValue, singleSellerTotalPaidValue } from '#controllers/paymentController/paymentController.js';
import { getAllsinglePaymentToSeller, updatePaymentToSeller } from '#controllers/paymentToSellerController/paymentToSellerController.js';
import {Router} from 'express'

const sellerPaymentRoutes = Router()
sellerPaymentRoutes.get("/totalPayment",singleSellerTotalOrderValue)
sellerPaymentRoutes.get("/paidPayment",singleSellerTotalPaidValue)
sellerPaymentRoutes.get("/getAllsinglePaymentToSeller",getAllsinglePaymentToSeller)
sellerPaymentRoutes.patch("/approvePayment/:id",updatePaymentToSeller)




export default  sellerPaymentRoutes;