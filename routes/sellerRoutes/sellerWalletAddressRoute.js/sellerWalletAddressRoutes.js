import {
  sellerWalletAddressUpdate,
  } from "#controllers/sellerWalletAddresController/sellerWalletAddressController.js";
  import { Router } from "express";
  
  const sellerWalletAddressRoutes = Router();
  
  sellerWalletAddressRoutes.route("/address-update").patch(sellerWalletAddressUpdate)
  
  export default sellerWalletAddressRoutes;


  