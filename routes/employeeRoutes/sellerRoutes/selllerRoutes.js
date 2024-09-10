

import { getSellerTotalOrderSum, getSingleSellerTotalPaidPayment } from "#controllers/paymentController/paymentController.js"
import { getSingleProduct, getSingleStoreProduct } from "#controllers/productController/productController.js"
import { getSellerAllStore, getSellerSingleStore, permittedToSellApparel, totalStores } from "#controllers/storeController/storeController.js"
import { getAllSellers, totalSellers } from "#controllers/userControllers/employeeControllers/employeeController.js"
import { getSingleSeller } from "#controllers/userControllers/sellerControllers/sellerController.js"
import orderRoutes from "./orderRoutes.js"

import { Router } from "express"
const sellerRoutes = Router()

sellerRoutes.get('/getAllSeller' ,getAllSellers)
sellerRoutes.get('/getSingleSeller/:id',getSingleSeller)
sellerRoutes.route("/getSellerAllstore/:id").get(getSellerAllStore)
sellerRoutes.route("/getSellerSinglestore/:id").get(getSellerSingleStore)
sellerRoutes.route("/getSingleStoreProduct/:id").get(getSingleStoreProduct)
sellerRoutes.route("/getSingleProduct/:id").get(getSingleProduct)
sellerRoutes.route("/totalSellers").get(totalSellers)
sellerRoutes.route("/totalStores").get(totalStores)

sellerRoutes.route("/totalOrderValue/:id").get(getSellerTotalOrderSum)
sellerRoutes.route("/getSingleSellerTotalPaidPayment/:id").get(getSingleSellerTotalPaidPayment)
sellerRoutes.use("/orders",orderRoutes)
sellerRoutes.route("/permittedToSellApparel/:id").patch(permittedToSellApparel)

export default sellerRoutes;