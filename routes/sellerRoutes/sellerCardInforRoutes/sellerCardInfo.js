import {
  getCardInfo,
  setCardInfo,
  singleCardInfo,
  updateCardInfo,
} from "#controllers/sellerCardInfoController/sellerCardInfoController.js";
import { Router } from "express";

const sellerCardInfoRoutes = Router();

sellerCardInfoRoutes.route("/").get(getCardInfo).post(setCardInfo);
sellerCardInfoRoutes.route("/:id").patch(updateCardInfo).get(singleCardInfo);

export default sellerCardInfoRoutes;
