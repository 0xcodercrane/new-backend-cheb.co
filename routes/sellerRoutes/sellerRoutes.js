import { Router } from "express";
import storeRoutes from "./storeRoutes/storeRoutes.js";
import productRoutes from "./productRoutes/productRoutes.js";
import productSizeRoutes from "./productSizeRoutes/productSizeRoutes.js";
import productColorRoutes from "./productColorRoutes/productColorRoutes.js";
import orderRoutes from "./orderRoutes/orderRoutes.js";
import sellerPaymentRoutes from "./paymentRoutes/paymentRoutes.js";
import { sellerDashboardInfo, sellerDashboardRevenueGraph } from "#controllers/dashboardInfoController/dashboardInfoController.js";
import sellerCardInfoRoutes from "./sellerCardInforRoutes/sellerCardInfo.js";
import sellerWalletAddressRoutes from "./sellerWalletAddressRoute.js/sellerWalletAddressRoutes.js";

const sellerRoutes = Router();

// store
sellerRoutes.use("/store", storeRoutes);

// order
sellerRoutes.use("/orders", orderRoutes);

// product
sellerRoutes.use("/product", productRoutes);

// product sizes

sellerRoutes.use("/product/productSize", productSizeRoutes);

// product color
sellerRoutes.use("/product/productColor", productColorRoutes);

// for payment
sellerRoutes.use("/payment", sellerPaymentRoutes);

sellerRoutes.use("/cardInfo", sellerCardInfoRoutes);

sellerRoutes.route("/dashboardPaymentInfo").get(sellerDashboardInfo);
sellerRoutes.route("/dashboardRevenueInfo/:limit").get(sellerDashboardRevenueGraph);
sellerRoutes.use("/wallet",sellerWalletAddressRoutes)

export default sellerRoutes;
