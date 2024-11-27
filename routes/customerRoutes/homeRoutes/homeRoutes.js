import { getHomePageData, getHomePageSearchData, getNotifications, getSearchListData } from '#controllers/homeController/homeController.js';
import { Router } from 'express';

const homeRoutes = Router();
// Routes
homeRoutes.route('/').get(getHomePageData);
homeRoutes.route('/search-list').get(getHomePageSearchData);
homeRoutes.route('/getProductSearch').get(getSearchListData);
homeRoutes.route('/get-notification').get(getNotifications);
// Export
export default homeRoutes;
