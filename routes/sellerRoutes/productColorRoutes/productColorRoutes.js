import {
  getAllColor,
  getAllColorByType,
  getAllColorWithProductId,
} from "#controllers/colorController/colorController.js";
import {
  addProductColor,
  deleteProductColor,
  getAllProductColor,
  getProductColorByProductId,
  getSingleProductColor,
  updateProductColor,
} from "#controllers/colorController/productColorController.js";
import { Router } from "express";

const productColorRoutes = Router();

productColorRoutes.route("/").get(getAllProductColor).post(addProductColor);
productColorRoutes.route("/getAllColor/:id").get(getAllColorWithProductId);
productColorRoutes
  .route("/:id")
  .get(getSingleProductColor)
  .patch(updateProductColor)
  .delete(deleteProductColor);
productColorRoutes
  .route("/getColorByProductId/:id")
  .get(getProductColorByProductId);
productColorRoutes.route("/getAllColorByType/:type").get(getAllColorByType);

export default productColorRoutes;
