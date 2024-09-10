import {
  addSize,
  archiveSize,
  deleteSize,
  getAllSize,
  getAllSizeByType,
  getSingleSize,
  updateSize,
} from "#controllers/sizeControllers/sizeControllers.js";
import { Router } from "express";

const sizeRoutes = Router();

sizeRoutes.post("/createSize", addSize);
sizeRoutes.get("/getAllSize", getAllSize);
sizeRoutes.get("/getSingleSize/:id", getSingleSize);
sizeRoutes.patch("/updateSize/:id", updateSize);
sizeRoutes.patch("/archiveSize/:id", archiveSize);
sizeRoutes.delete("/deleteSize/:id", deleteSize);
sizeRoutes.get("/getAllSizeByType/:type", getAllSizeByType);

export default sizeRoutes;
