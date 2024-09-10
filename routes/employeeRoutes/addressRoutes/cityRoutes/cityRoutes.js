import { addCity, deleteCity, getAllCity, getSingleCity, updateCity } from "#controllers/addressController/cityController.js"
import { Router } from "express"


const cityRoutes = Router()


cityRoutes.route("/").post(addCity)
cityRoutes.route("/:id").get(getSingleCity).patch(updateCity).delete(deleteCity)
cityRoutes.route("/cityByState/:id").get(getAllCity)


export default cityRoutes;