import {
  deleteProduct,
  getAllProduct,
  getAllProductByType,
  getAllProductRequested,
  getSingleProduct,
  setProduct,
  updateRequestedProductAction,
  updateSingleProduct,
} from "#controllers/productController/productController.js";
import {
  deleteProductImage,
  getSingleProductImages,
} from "#controllers/productController/ProductImageController.js";
import { Router } from "express";

const productRoutes = Router();

productRoutes.route("/").post(setProduct).get(getAllProduct);
productRoutes.route("/getProductByType").get(getAllProductByType);
productRoutes.route("/getProductRequested").get(getAllProductRequested);
productRoutes.route("/updateProductAction").get(updateRequestedProductAction);

productRoutes
  .route("/:id")
  .get(getSingleProduct)
  .patch(updateSingleProduct)
  .delete(deleteProduct);

productRoutes
  .route("/productImages/:id")
  .get(getSingleProductImages)
  .delete(deleteProductImage);

export default productRoutes;
