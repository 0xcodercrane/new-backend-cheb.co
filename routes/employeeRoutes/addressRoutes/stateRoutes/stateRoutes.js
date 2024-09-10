import { addState, deleteStateAddress, getAllStateAddress, getSingleStateAddress, updateStateAddress } from "#controllers/addressController/stateController.js"

import { Router } from "express"

const stateRoutes = Router()


stateRoutes.route("/").get(getAllStateAddress).post(addState)
stateRoutes.route("/:id").get(getSingleStateAddress).patch(updateStateAddress).delete(deleteStateAddress)

export default stateRoutes;
