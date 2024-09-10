import asyncHandler from "express-async-handler";
import SellerRecommendation from "#models/productModel/upSellingProductModal.js";
import BoughtTogether from "#models/productModel/boughtTogetherModel.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";

const getSellerRecommendation = asyncHandler(async (req, res) => {
  // const { id } = { id: "66b89ce6d04b5abd7ffa0bb8" };
  // const { storeId } = { storeId: "66b89ce6d04b5abd7ffa0bb8" };
  // console.log(storeId, "storeId");
  // console.log(
  //   id,
  //   "===================================================================="
  // );
  // const recommendedProducts = await SellerRecommendation.find({
  //   sellerStoreProduct: id,
  // })
  //   .populate("recommendedItem")
  //   .limit(3);

  const { id } = req.params;
  const { storeId } = req.query;
  console.log(storeId, "storeId");
  console.log(id, "id");

  const sellerStoreProduct = await SellerStoreProduct.findOne({
    product: id,
    sellerStore: storeId,
  });
  // console.log(sellerStoreProduct, "sellerStoreProduct");

  const recommendedProducts = await SellerRecommendation.find({
    sellerStoreProduct: sellerStoreProduct._id,
  })
    .populate("recommendedItem")
    .limit(3);

  const products = recommendedProducts.map((product) => {
    return product.recommendedItem;
  });
  res.status(200).json(products);
});

const getBoughtTogether = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const recommendedProduct = await BoughtTogether.find({
    primaryId: id,
  })
    .populate("secondaryId")
    .sort({ count: 1 })
    .limit(3);

  const products = recommendedProduct.map((product) => {
    return product.secondaryId;
  });

  res.status(200).json(products);
});

export { getSellerRecommendation, getBoughtTogether };
