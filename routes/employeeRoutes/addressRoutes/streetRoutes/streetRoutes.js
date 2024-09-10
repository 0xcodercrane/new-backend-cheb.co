import { addStreet, deleteStreet, getAllStreet, getSingleStreet, updateStreet } from "#controllers/addressController/streetController.js"

import { Router } from "express"

const streetRoutes = Router()

streetRoutes.route("/").post(addStreet)
streetRoutes.route("/streetByCity/:id").get(getAllStreet)
streetRoutes.route("/:id").get(getSingleStreet).patch(updateStreet).delete(deleteStreet)


export default streetRoutes;
