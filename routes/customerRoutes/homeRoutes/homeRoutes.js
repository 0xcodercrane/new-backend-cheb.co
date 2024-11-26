import { getHomePageData, getHomePageSearchData, getSearchListData } from '#controllers/homeController/homeController.js';
import { Router } from 'express';

const homeRoutes = Router();
// Routes
homeRoutes.route('/').get(getHomePageData);
homeRoutes.route('/search-list').get(getHomePageSearchData);
homeRoutes.route('/getProductSearch').get(getSearchListData);
// Export
export default homeRoutes;
