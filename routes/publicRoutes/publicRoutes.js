import {Router} from 'express'
import employeeAuthRoutes from './authRoutes/employeeAuthRoutes/employeeAuthRoutes.js'
import customerAuthRoutes from './authRoutes/customerAuthRoutes/customerAuthRoutes.js'
import sellerAuthRoutes from './authRoutes/sellerAuthRoutes/sellerAuthRoutes.js'



const publicRoutes = Router()

publicRoutes.use('/employeeAuth', employeeAuthRoutes)
publicRoutes.use('/customerAuth', customerAuthRoutes)
publicRoutes.use('/sellerAuth', sellerAuthRoutes)

export default publicRoutes;