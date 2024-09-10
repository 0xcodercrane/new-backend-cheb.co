
import { addSellerStoreProduct } from "#controllers/productController/sellerStoreProductController.js";
import { addSellerStoreProductSize, addSellerStoreProductSizeRetailCost } from "#controllers/productController/sellerStoreProductSizeController.js";
import { addSellerType } from "#controllers/userControllers/employeeControllers/employeeController.js";
import { Router } from "express";

const migrationRoutes = Router();

migrationRoutes.route('/addSellerStoreProduct').get(addSellerStoreProduct)
migrationRoutes.route('/addSellerStoreProductSize').get(addSellerStoreProductSize)
migrationRoutes.route('/addSellerStoreProductSizeRetailCost').get(addSellerStoreProductSizeRetailCost)
migrationRoutes.route('/addSellerType').get(addSellerType)


export default migrationRoutes;