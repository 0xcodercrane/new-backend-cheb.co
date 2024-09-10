// Imports
import { deleteAddress, getMyAddresses, getSingleAddress, setAddress, updateAddress } from '#controllers/addressController/addressController.js';
import { protectForCustomer } from '#middlewares/authMiddleware.js';
import { Router } from 'express';

const addressRoutes = Router();

// Routes
addressRoutes.route('/').post(protectForCustomer, setAddress);
addressRoutes.route('/:id').patch(protectForCustomer, updateAddress).delete(protectForCustomer, deleteAddress);
addressRoutes.route('/getMyAddresses').get(protectForCustomer, getMyAddresses)
addressRoutes.route('/getSingleAddress/:id').get(protectForCustomer,getSingleAddress)


// Export 
export default addressRoutes;