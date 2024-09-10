import {
  addProductSize,
  deleteProductSize,
  getProductSizeByProductId,
  getSingleProductSize,
  updateProductSize,
} from "#controllers/sizeControllers/productSizeControllers.js";
import {
  getAllSize,
  getAllSizeByType,
  getAllSizeByTypeAndGender,
} from "#controllers/sizeControllers/sizeControllers.js";
import { Router } from "express";

const productSizeRoutes = Router();

productSizeRoutes.get("/getAllSize", getAllSize);
productSizeRoutes.get("/getAllSizeByType/:type", getAllSizeByType);
productSizeRoutes.get("/getAllSizeBySizeAndGender", getAllSizeByTypeAndGender);
productSizeRoutes.post("/createProductSize", addProductSize);
productSizeRoutes.get("/getSingleProductSize/:id", getSingleProductSize);
productSizeRoutes.patch("/updateProductSize/:id", updateProductSize);
productSizeRoutes.delete("/deleteProductSize/:id", deleteProductSize);
productSizeRoutes.get("/getSizeByProductId/:id", getProductSizeByProductId);
// productSizeRoutes.get("/getAllProductSize",getAllProductSize)

export default productSizeRoutes;
