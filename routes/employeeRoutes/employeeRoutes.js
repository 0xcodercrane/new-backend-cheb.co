import {
  archiveEmployee,
  deleteEmployee,
  getAllEmployees,
  getMe,
} from "#controllers/userControllers/employeeControllers/employeeController.js";
import { Router } from "express";
import stateRoutes from "./addressRoutes/stateRoutes/stateRoutes.js";
import customerRoutes from "./customerRoutes/customerRoutes.js";
import sellerRoutes from "./sellerRoutes/selllerRoutes.js";
import cityRoutes from "./addressRoutes/cityRoutes/cityRoutes.js";
import employeeInviteRoutes from "./employeeInviteRoutes/employeeInviteRoutes.js";
import streetRoutes from "./addressRoutes/streetRoutes/streetRoutes.js";
import sizeRoutes from "./sizeRoutes/sizeRoutes.js";
import colorRoutes from "./colorRoutes/colorRoutes.js";
import paymentToSellerRoutes from "./paymentToSellerRoutes/paymentToSellerRoutes.js";
import { totalOrderValue } from "#controllers/orderControllers/orderController.js";
import { totalPaymentToSeller } from "#controllers/paymentToSellerController/paymentToSellerController.js";
import { totalProducts } from "#controllers/productController/productController.js";
import { adminChangePassword, adminDashboardInfo, getProfileData } from "#controllers/dashboardInfoController/dashboardInfoController.js";
import productRoutes from "./productRoutes/productRoutes.js";

const employeeRoutes = Router();

employeeRoutes.get("/", getMe);
employeeRoutes.get("/getAllEmployees", getAllEmployees);
employeeRoutes.delete("/deleteEmployee/:id", deleteEmployee);
employeeRoutes.patch("/archiveEmployee/:id", archiveEmployee);

// Invite
employeeRoutes.use("/employeeInvite", employeeInviteRoutes);

// Customer
employeeRoutes.use("/customer", customerRoutes);

// Seller
employeeRoutes.use("/seller", sellerRoutes);

// payment
employeeRoutes.use("/paymentToSeller", paymentToSellerRoutes);

// Address
employeeRoutes.use("/address/state/", stateRoutes);
employeeRoutes.use("/address/state/city", cityRoutes);
employeeRoutes.use("/address/state/city/street", streetRoutes);

employeeRoutes.use("/product", productRoutes);
employeeRoutes.use("/size", sizeRoutes);
employeeRoutes.use("/color", colorRoutes);

employeeRoutes.use("/totalOrderValue", totalOrderValue);
employeeRoutes.use("/totalPaymentToSeller", totalPaymentToSeller);
employeeRoutes.use("/totalProducts", totalProducts);

employeeRoutes.route("/dashboardInfo").get(adminDashboardInfo);
employeeRoutes.route("/change-password").post(adminChangePassword);
employeeRoutes.route("/profile").all(getProfileData);

export default employeeRoutes;
