// Imports
import { Router } from 'express'
import { getVats, setVat, updateVat } from '../../controllers/orderSettingsControllers/vatController.js'

const router = Router()

import {protectForEmployee} from '../../middleware/authMiddleware.js'

// Routes
router.route('/').get(getVats).post(protectForEmployee, setVat)
router.route('/:id').patch(protectForEmployee, updateVat)

// Export
export default router