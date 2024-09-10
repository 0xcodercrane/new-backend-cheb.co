import Order from "#models/orderModels/orderItemsModel.js";
import expressAsyncHandler from "express-async-handler";

const createRecommendedProduct = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const orders = await Order.find({ item: id });
});
