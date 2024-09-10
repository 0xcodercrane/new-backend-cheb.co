import { Router } from 'express';
import {
  addPendingCryptoOder,
  createOrderByCrpyto,
  getSinglePendingCryptoOrder,
} from '#controllers/PendingCryptoOrderController/PendingCryptoOrderController.js';

const pendingCryptoOrderRoutes = Router();

pendingCryptoOrderRoutes.route('/').post(addPendingCryptoOder);
pendingCryptoOrderRoutes.route('/order').post(createOrderByCrpyto);
pendingCryptoOrderRoutes.route('/:id').get(getSinglePendingCryptoOrder);

// Export
export default pendingCryptoOrderRoutes;
