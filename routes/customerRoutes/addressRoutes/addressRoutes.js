// Imports
import { checkAddressValid, deleteAddress, getCarrierCharge, getMyAddresses, getSingleAddress, setAddress, updateAddress, updateDeliveryStatus } from '#controllers/addressController/addressController.js';
import { protectForCustomer } from '#middlewares/authMiddleware.js';
import { Router } from 'express';

const addressRoutes = Router();

// Routes
addressRoutes.route('/').post(protectForCustomer, setAddress);
addressRoutes.route('/:id').patch(protectForCustomer, updateAddress).delete(protectForCustomer, deleteAddress);
addressRoutes.route('/getMyAddresses').get(protectForCustomer, getMyAddresses)
addressRoutes.route('/getSingleAddress/:id').get(protectForCustomer,getSingleAddress)

//get address based delivery Charge and expected date
addressRoutes.route('/get-carrier-charge').post(protectForCustomer,getCarrierCharge);
addressRoutes.route('/check-address-verification').post(protectForCustomer,checkAddressValid);

//Easy-post tracking.
addressRoutes.route("/tracking-shipping/easypost-webhook").post(updateDeliveryStatus);




// Export 
export default addressRoutes;