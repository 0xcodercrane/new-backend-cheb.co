// Imports
import { Router } from 'express'
import { loginEmployee, registerEmployee } from '../../../../controllers/userControllers/employeeControllers/employeeController.js'
import { getEmailFromInviteToken } from '../../../../controllers/userControllers/employeeControllers/employeeInviteController.js'
import { forgotEmployeePassword, resetEmployeePassword } from '../../../../controllers/userControllers/employeeControllers/employeePasswordController.js'


const employeeAuthRoutes = Router()

// Routes
employeeAuthRoutes.post('/register', registerEmployee)
employeeAuthRoutes.post('/login', loginEmployee)
employeeAuthRoutes.post('/forgotEmployeePassword', forgotEmployeePassword)
employeeAuthRoutes.patch('/resetEmployeePassword', resetEmployeePassword)
employeeAuthRoutes.get('/getEmailFromToken/:token', getEmailFromInviteToken)

// Export
export default employeeAuthRoutes;