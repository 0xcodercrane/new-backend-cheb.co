import { getHomePageData } from '#controllers/homeController/homeController.js';
import { Router } from 'express';

const homeRoutes = Router();
// Routes
homeRoutes.route('/').get(getHomePageData);
// Export
export default homeRoutes;
