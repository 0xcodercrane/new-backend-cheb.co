
import { singleSellerTotalOrderValue, singleSellerTotalPaidValue } from '#controllers/paymentController/paymentController.js';
import { getAllsinglePaymentToSeller, linkSellerAccount, transferToSeller, updatePaymentToSeller } from '#controllers/paymentToSellerController/paymentToSellerController.js';
import {Router} from 'express'

const sellerPaymentRoutes = Router()
sellerPaymentRoutes.get("/totalPayment",singleSellerTotalOrderValue)
sellerPaymentRoutes.get("/paidPayment",singleSellerTotalPaidValue)
sellerPaymentRoutes.get("/getAllsinglePaymentToSeller",getAllsinglePaymentToSeller)
sellerPaymentRoutes.patch("/approvePayment/:id",updatePaymentToSeller)
sellerPaymentRoutes.get("/config",linkSellerAccount)
sellerPaymentRoutes.post("/transfer",transferToSeller)




export default  sellerPaymentRoutes;