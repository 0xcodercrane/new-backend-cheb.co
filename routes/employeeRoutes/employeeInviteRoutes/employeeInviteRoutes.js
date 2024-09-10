import { deleteInvite, getAllInvites, getEmailFromToken, getSingleInvite, inviteEmployee } from "#controllers/userControllers/employeeControllers/employeeInviteController.js"
import { Router } from "express"



const employeeInviteRoutes = Router()

// employee invite
employeeInviteRoutes.post('/createInvite', inviteEmployee)
employeeInviteRoutes.get('/getEmailFromToken/:token', getEmailFromToken)
employeeInviteRoutes.get('/getAllInvites', getAllInvites)
employeeInviteRoutes.get('/getSingleInvite/:id', getSingleInvite)
employeeInviteRoutes.delete('/deleteInvite/:id', deleteInvite)

export default employeeInviteRoutes;