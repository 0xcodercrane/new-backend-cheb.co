// Imports
import { deleteAddress, getAllAddresses, getCustomerAddressesById, getSingleAddress, setAddress, updateAddress } from '#controllers/addressController/addressController.js';
import { protectForCustomer, protectForEmployee } from '#middlewares/authMiddleware.js';
import { Router } from 'express';

const customerAddressRoutes = Router();

// Routes
customerAddressRoutes.route('/addressByCustomerId/:id').get(getCustomerAddressesById)
customerAddressRoutes.route('/getSingleAddress/:id').get(getSingleAddress)


// Export 
export default customerAddressRoutes;