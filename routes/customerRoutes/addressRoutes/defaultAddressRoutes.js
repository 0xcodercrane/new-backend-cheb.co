// Imports
import { Router } from 'express';

const router = Router();

import { makeDefaultAddress, getMyDefaultAddress } from '../../controllers/addressControllers/defaultAddressController.js';

import {protectForCustomer} from '../../middleware/authMiddleware.js'

// Routes
router.route('/').get(protectForCustomer, getMyDefaultAddress)
router.route('/:id').post(protectForCustomer, makeDefaultAddress)

// Export
export default router