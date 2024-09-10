// Imports
import { Router } from 'express'
import { getDiscounts, setDiscount, updateDiscount } from '../../controllers/orderSettingsControllers/discountController.js'

const router = Router()

import {protectForEmployee} from '../../middleware/authMiddleware.js'

// Routes
router.route('/').get(getDiscounts).post(protectForEmployee, setDiscount)
router.route('/:id').patch(protectForEmployee, updateDiscount)

// Export
export default router