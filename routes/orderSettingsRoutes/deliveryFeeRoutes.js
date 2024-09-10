// Imports
import { Router } from 'express'
import { deleteDeliveryFee, getDeliveryFees, setDeliveryFee, updateDeliveryFee } from '../../controllers/orderSettingsControllers/deliveryFeeController.js'

const router = Router()

import {protectForEmployee} from '../../middleware/authMiddleware.js'

// Routes
router.route('/').get(getDeliveryFees).post(protectForEmployee, setDeliveryFee)
router.route('/:id').patch(protectForEmployee, updateDeliveryFee).delete(protectForEmployee, deleteDeliveryFee)

// Export
export default router