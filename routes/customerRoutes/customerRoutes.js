// Imports
import { Router } from "express";
import {
  getAllProductsForConsumer,
  getAllTrendingProducts,
  getFeaturedApparel,
  getSellerStoreProductsByType,
  getSingleProductBySlug,
  getSingleStoreProduct,
  getTrendingSneaker,
} from "#controllers/productController/productController.js";
import {
  singleProfile,
  updateProfile,
} from "#controllers/userControllers/customerControllers/profileController/profileController.js";
import addressRoutes from "./addressRoutes/addressRoutes.js";
import { getProductSizeByProductId } from "#controllers/sizeControllers/productSizeControllers.js";
import { getProductColorByProductId } from "#controllers/colorController/productColorController.js";
import {
  getAllOrderItems,
  getMyOrdersByStatus,
  getMySingleOrder,
  getMySingleOrderItems,
  getMySingleOrderReviewByOrderId,
} from "#controllers/orderControllers/orderController.js";
import { protectForCustomer } from "#middlewares/authMiddleware.js";
import orderRoutes from "./orderRoutes/orderRoutes.js";
import paymentRoutes from "./paymentRoutes/paymentRoutes.js";
import {
  getAllStore,
  getAllStoreByType,
  getSellerSingleStore,
  getSingleStoreBySlug,
} from "#controllers/storeController/storeController.js";
import { getSingleProductImages } from "#controllers/productController/ProductImageController.js";
import {
  getBoughtTogether,
  getSellerRecommendation,
} from "#controllers/recommendationController/recommendationController.js";
import reviewRoutes from "./reviewRoutes/reviewRoutes.js";
import homeRoutes from "./homeRoutes/homeRoutes.js";
import { getProductSizes } from "#controllers/productController/sellerStoreProductSizeController.js";
import {
  getAllSellerStoreProduct,
  getSellersStoreByProduct,
  getSingleProductAveragePrice,
  getSingleSellerStoreProductById,
} from "#controllers/sellerStoreProductController/sellerStoreProductController.js";
import pendingCryptoOrderRoutes from "./orderRoutes/pendingCryptoOrderRoutes.js";

const customerRoutes = Router();

customerRoutes
  .route("/getAllProductsForConsumer")
  .get(getAllSellerStoreProduct);
customerRoutes
  .route("/getSingleSellerStoreProductById/:id")
  .get(getSingleSellerStoreProductById);
customerRoutes
  .route("/getSingleProductBySlug/:slug")
  .get(getSingleProductBySlug);
// consumerRoutes.route("getS")

customerRoutes
  .route("/getSellersStoreByProduct/:id")
  .get(getSellersStoreByProduct);

customerRoutes
  .route("/getSingleProductAveragePrice/:id")
  .get(getSingleProductAveragePrice);

customerRoutes.route("/getFeaturedApparel").get(getFeaturedApparel);
customerRoutes.route("/getTrendingSneakers").get(getTrendingSneaker);
customerRoutes.route("/getAllTrendingProducts").get(getAllTrendingProducts);
customerRoutes.route("/getAllStores").get(getAllStore);
customerRoutes.route("/getAllStoreByType").get(getAllStoreByType);
customerRoutes
  .route("/getSingleProductBySlug/:slug")
  .get(getSingleProductBySlug);

customerRoutes.route("/getSingleProductSizes").get(getProductSizes);

customerRoutes.route("/getProductSize/:id").get(getProductSizeByProductId);
customerRoutes.route("/getProductColor/:id").get(getProductColorByProductId);
customerRoutes
  .route("/myProfile")
  .get(protectForCustomer, singleProfile)
  .patch(protectForCustomer, updateProfile);

customerRoutes
  .route("/getMyOrdersByStatus/:orderStatus")
  .get(protectForCustomer, getMyOrdersByStatus);
customerRoutes
  .route("/getMySingleOrder/:id")
  .get(protectForCustomer, getMySingleOrder);

customerRoutes
  .route("/getAllOrderItems/")
  .get(protectForCustomer, getAllOrderItems);

customerRoutes.route("/getMySingleOrderItems/:id").get(getMySingleOrderItems);
customerRoutes
  .route("/getMySingleOrderReview/:id")
  .get(protectForCustomer, getMySingleOrderReviewByOrderId);

customerRoutes.route("/getSingleProductImages/:id").get(getSingleProductImages);
customerRoutes.route("/getSingleStoreProducts/:id").get(getSingleStoreProduct);
customerRoutes.route("/getSingleStore/:id").get(getSellerSingleStore);
customerRoutes.route("/getSingleStoreBySlug/:slug").get(getSingleStoreBySlug);

customerRoutes.use("/review", reviewRoutes);
customerRoutes.use("/profile/address", addressRoutes);
customerRoutes.use("/order", protectForCustomer, orderRoutes);
customerRoutes.use("/payment-intent", paymentRoutes);
customerRoutes.use("/home", homeRoutes);







customerRoutes.use("/getSellerRecommendation/:id", getSellerRecommendation);
customerRoutes.use("/getBoughtTogether/:id", getBoughtTogether);
customerRoutes.use(
  "/pendingCryptoOrder",
  protectForCustomer,
  pendingCryptoOrderRoutes
);
customerRoutes.use("/pendingCrypto", pendingCryptoOrderRoutes);



// Export
export default customerRoutes;
