import {
  deleteProductImage,
  getSingleProductImages,
} from "#controllers/productController/ProductImageController.js";
import {
  archiveProduct,
  deleteProduct,
  getAllProduct,
  getAllProductByType,
  getAllStoreProduct,
  getNotAddedProductByType,
  getSellerStoreProductsByType,
  getSingleProduct,
  getSingleProductAllItem,
  setProduct,
  updateSingleProduct,
} from "#controllers/productController/productController.js";
import { createApparel } from "#controllers/productController/sellerStoreProductController.js";
import {
  getSellerStoreProductSizesById,
  updateSellerStoreProductSize,
} from "#controllers/productController/sellerStoreProductSizeController.js";
import { getSellerRecommendation } from "#controllers/recommendationController/recommendationController.js";
import {
  activeSellerStoreProduct,
  createSellerStoreProduct,
  getSellerStoreProducts,
  searchForRecommendProducts,
  // searchForRecommendProducts,
} from "#controllers/sellerStoreProductController/sellerStoreProductController.js";
import { getAllSize } from "#controllers/sizeControllers/sizeControllers.js";

import { Router } from "express";

const productRoutes = Router();

productRoutes.get("/getAllProduct", getAllProduct);
productRoutes.get("/getAllStoreProduct", getAllStoreProduct);

productRoutes.get("/getSellerStoreProductByType", getSellerStoreProductsByType);
productRoutes.get(
  "/getSellerStoreProductSizesById/:id",
  getSellerStoreProductSizesById
);
productRoutes.patch(
  "/updateSellerStoreProductSize",
  updateSellerStoreProductSize
);
productRoutes.get("/getAllSize", getAllSize);
productRoutes.get("/getSingleProductAllItem/:id", getSingleProductAllItem);

productRoutes.post("/createProduct", createSellerStoreProduct);
productRoutes.post("/createApparel", createApparel);
productRoutes.get("/getSellerStoreProducts/:id", getSellerStoreProducts);
productRoutes.get("/getSellerRecommendation/:id", searchForRecommendProducts);

productRoutes.route("/getSingleProduct/:id").get(getSingleProduct);
productRoutes.patch("/updateSingleProduct/:id", updateSingleProduct);
productRoutes.delete("/deleteProduct/:id", deleteProduct);
productRoutes.patch("/archiveProduct/:id", archiveProduct);
productRoutes.patch("/activeSellerStoreProduct/:id", activeSellerStoreProduct);

productRoutes.get("/getAllProductByType", getAllProductByType);
productRoutes.get("/getNotAddedProductByType", getNotAddedProductByType);

// Product Images
productRoutes.get("/productImages/:id", getSingleProductImages);
productRoutes.delete("/deleteProductImages/:id", deleteProductImage);

//Seller Recommendation
productRoutes.get("/upSellProduct/:id", getSellerRecommendation);

productRoutes.route("/createApparel").post(createApparel);

export default productRoutes;
