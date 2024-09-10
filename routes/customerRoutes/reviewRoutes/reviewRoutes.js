import {
  createReview,
  getAverageRating,
  getStoreReview,
} from "#controllers/reviewController/reviewController.js";
import { protectForCustomer } from "#middlewares/authMiddleware.js";
import { Router } from "express";

const reviewRoutes = Router();

reviewRoutes.route("/create").post(protectForCustomer, createReview);
reviewRoutes.route("/:store").get(getStoreReview);
reviewRoutes.route("/averageRating/:id").get(getAverageRating);

export default reviewRoutes;
