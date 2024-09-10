// Imports

import {
  createMobileOrder,
  createOrderByCrpyto,
  createOrderByStripePayment,
  createPaymentIntent,
  dispatchStripeSaveCard,
  getCustomerStripeId,
  paymentIntent,
} from "#controllers/paymentController/paymentController.js";
import { protectForCustomer } from "#middlewares/authMiddleware.js";
import { Router } from "express";

const paymentRoutes = Router();

paymentRoutes.route("/").post(protectForCustomer, paymentIntent);
paymentRoutes.route("/mobile").post(protectForCustomer, createPaymentIntent);
paymentRoutes
  .route("/createOrderByCrpyto")
  .post(protectForCustomer, createOrderByCrpyto);
// paymentRoutes.route("/createOrderByStripePayment",createOrderByStripePayment)
paymentRoutes
  .route("/createOrderByStripePayment")
  .get(createOrderByStripePayment);
paymentRoutes
  .route("/getCustomerStripeId")
  .get(protectForCustomer, getCustomerStripeId);
paymentRoutes
  .route("/payment_methods/:id/detach")
  .delete(protectForCustomer, dispatchStripeSaveCard);
paymentRoutes
  .route("/createMobileOrder")
  .post(protectForCustomer, createMobileOrder);

// Export
export default paymentRoutes;
