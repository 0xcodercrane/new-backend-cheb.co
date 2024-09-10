import {
  deleteProduct,
  getAllProduct,
  getAllProductByType,
  getSingleProduct,
  setProduct,
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
