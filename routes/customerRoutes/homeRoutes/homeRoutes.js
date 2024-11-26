import { getHomePageData, getHomePageSearchData } from '#controllers/homeController/homeController.js';
import { Router } from 'express';

const homeRoutes = Router();
// Routes
homeRoutes.route('/').get(getHomePageData);
homeRoutes.route('/search-list').get(getHomePageSearchData);
// Export
export default homeRoutes;
