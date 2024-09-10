import { getSingleStoreProduct, getSingleStoreProductForSeller } from "#controllers/productController/productController.js";
import { addStore, archiveStore, deleteStore, getSellerAllStore, getSellerAllStoresById, getSellerSingleStore, updateStore } from "#controllers/storeController/storeController.js";
import {Router} from 'express'

const storeRoutes = Router()

storeRoutes.post('/add-store', addStore);
storeRoutes.route("/getSellerAllstore/:id").get(getSellerAllStoresById)
storeRoutes.route("/getSellerSinglestore/:id").get(getSellerSingleStore)
storeRoutes.route("/getSingleStoreProduct/:id").get(getSingleStoreProductForSeller)
storeRoutes.route("/updateStore/:id").patch(updateStore)
storeRoutes.route("/archiveStore/:id").patch(archiveStore)
storeRoutes.route("/deleteStore/:id").delete(deleteStore)


export default storeRoutes;