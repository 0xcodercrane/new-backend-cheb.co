

import { addPaymentToSeller, getAllPaymentToSeller, getSinglePaymentToSeller } from "#controllers/paymentToSellerController/paymentToSellerController.js";
import { Router } from "express"
const paymentToSellerRoutes = Router()

paymentToSellerRoutes.route("/").get(getAllPaymentToSeller).post(addPaymentToSeller)
paymentToSellerRoutes.route("/id").get(getSinglePaymentToSeller)


export default paymentToSellerRoutes;