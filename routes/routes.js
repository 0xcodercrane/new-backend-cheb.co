// Imports
import { Router } from "express";

const routes = Router();

import {
  protectForEmployee,
  protectForSeller,
} from "#middlewares/authMiddleware.js";
import publicRoutes from "./publicRoutes/publicRoutes.js";
import sellerRoutes from "./sellerRoutes/sellerRoutes.js";
import customerRoutes from "./customerRoutes/customerRoutes.js";
import employeeRoutes from "./employeeRoutes/employeeRoutes.js";

routes.use("/public", publicRoutes);
routes.use("/employees", protectForEmployee, employeeRoutes);
routes.use("/sellers", protectForSeller, sellerRoutes);
routes.use("/customers", customerRoutes);

// Export
export default routes;
