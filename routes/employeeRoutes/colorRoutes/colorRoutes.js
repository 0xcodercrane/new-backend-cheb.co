import {
  addColor,
  archiveColor,
  deleteColor,
  getAllColor,
  getAllColorByType,
  getSingleColor,
  updateColor,
} from "#controllers/colorController/colorController.js";
import { Router } from "express";

const colorRoutes = Router();

colorRoutes.route("/").get(getAllColor).post(addColor);
colorRoutes.route("/getAllColorByType/:type").get(getAllColorByType);
colorRoutes
  .route("/:id")
  .get(getSingleColor)
  .patch(updateColor)
  .delete(deleteColor);
colorRoutes.patch("/archiveColor/:id", archiveColor);

export default colorRoutes;
