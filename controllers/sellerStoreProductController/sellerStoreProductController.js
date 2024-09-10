import asyncHandler from "express-async-handler";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import SellerRecommendation from "#models/productModel/upSellingProductModal.js";
import SellerStoreProductSize from "#models/productModel/sellerStoreProductSizeModel.js";
import Seller from "#models/userModels/sellerModel/sellerModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";

const createSellerStoreProduct = asyncHandler(async (req, res) => {
  const { sellerStore, product, type, recommendedItems, size } = req.body;

  //? create seller store product
  const sellerStoreProduct = await SellerStoreProduct.create({
    sellerStore,
    product,
    type,
    size,
  });
  // console.log(size, "size");

  //? Create seller recommendation
  let newRecommend = [];
  if (recommendedItems) {
    newRecommend = JSON.parse(recommendedItems);
  }
  // console.log(newRecommend, "newRecommend");
  const sellerRecommendation = newRecommend.map((item) => ({
    recommendedItem: item,
    sellerStoreProduct: sellerStoreProduct._id,
  }));
  // console.log(sellerRecommendation, "sellerRecommendation");
  const recommended = await SellerRecommendation.insertMany(
    sellerRecommendation
  );
  // console.log(recommended, "recommended");

  //? Seller Store Product Size
  const newSizes = JSON.parse(size);
  // console.log(newSizes, "newSizes");

  const sellerStoreProductSize = newSizes.map((size) => ({
    sellerStoreProduct: sellerStoreProduct._id,
    size: size.value,
    retailCost: size.price,
    gender: size.gender,
    stock: size.stock,
    productCondition: size.productCondition,
  }));

  const checkSize = await SellerStoreProductSize.insertMany(
    sellerStoreProductSize
  );

  console.log(checkSize, "sellerStoreProductSize");

  res.status(201).json(sellerStoreProduct);
});

const getAllSellerStoreProduct = asyncHandler(async (req, res) => {
  const { search, type } = req.query;

  let matchStage = {};

  if (type) {
    matchStage.type = type;
  }

  try {
    const products = await SellerStoreProduct.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "sellerstores",
          localField: "sellerStore",
          foreignField: "_id",
          as: "sellerStore",
        },
      },
      {
        $unwind: "$sellerStore",
      },

      // Add the search-related $match stage after the $lookup stages
      {
        $match: {
          ...(search?.trim() && {
            "product.name": { $regex: new RegExp(search.trim(), "i") },
          }),
        },
      },
      // Add other stages if necessary
    ]).sort({ createdAt: -1 });

    const seenProducts = new Set();

    const uniqueProducts = products.filter((product) => {
      const productId = product.product._id.toString();
      if (seenProducts.has(productId)) {
        return false;
      }
      seenProducts.add(productId);
      return true;
    });

    const activeProducts = uniqueProducts.filter(
      (product) => !product.product.isArchive
    );

    // console.log(activeProducts, "activeProducts");
    res.status(200).json(activeProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

const getSellerStoreProducts = asyncHandler(async (req, res) => {
  const { filter, search } = req.query;
  const query = {};

  console.log(search);

  if (filter === "archive") {
    query.isArchive = true;
  } else if (filter === "active") {
    query.isArchive = false;
  }
  const { id } = req.params;
  const sellerStoreProduct = await SellerStoreProduct.find({
    ...query,
    sellerStore: id,
  })
    .populate("sellerStore")
    .populate("product");

  console.log(sellerStoreProduct, "sellerStoreProduct");

  res.status(200).json(sellerStoreProduct);
});

const searchForRecommendProducts = asyncHandler(async (req, res) => {
  const { search, filter } = req.query;
  const { id } = req.params;

  console.log(search, "search");

  const products = await SellerStoreProduct.find({
    sellerStore: id,
  }).populate("product");

  const filteredProducts = products.filter(
    (product) =>
      product.product.name.toLowerCase().includes(search.toLowerCase()) &&
      product.isActive
  );

  res.status(200).json(filteredProducts);
});

const getSingleSellerStoreProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id, "id");
  // Check if `id` is defined and valid

  try {
    const sellerStoreProduct = await SellerStoreProduct.findOne({
      product: id,
    })
      .populate("product")
      .populate("sellerStore");
    if (!sellerStoreProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // console.log(sellerStoreProduct, "sellerStoreProduct");
    res.status(200).json(sellerStoreProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getSellersStoreByProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const type = req.query.type;
  const sellers = await SellerStore.find({ type });
  const sellerStoreIds = sellers.map((seller) => seller._id);

  const query = { product: id, isActive: true };

  if (type) {
    query.sellerStore = { $in: sellerStoreIds };
  }

  console.log(query, "query");
  const sellerStoreProduct = await SellerStoreProduct.find(query)
    .populate("sellerStore")
    .populate("product");

  res.status(200).json(sellerStoreProduct);
});

const getSingleProductAveragePrice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerStoreProduct = await SellerStoreProduct.find({
    product: id,
  }).populate("product");

  const sellerStoreProductSize = await SellerStoreProductSize.find({
    sellerStoreProduct: sellerStoreProduct[0]._id,
  });

  const totalRetailCost = sellerStoreProductSize.reduce(
    (acc, product) => acc + product.retailCost,
    0
  );
  const averageRetailCost = totalRetailCost / sellerStoreProductSize.length;

  console.log(averageRetailCost, "sellerStoreProduct");
  res.status(200).json(averageRetailCost);
});

const activeSellerStoreProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(req.body, "req.body");
  const sellerStoreProduct = await SellerStoreProduct.findById(id);

  if (!sellerStoreProduct) {
    res.status(404);
    throw new Error("Product not found");
  } else {
    await SellerStoreProduct.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    res.status(200).json(sellerStoreProduct);
  }
});

export {
  createSellerStoreProduct,
  getSellerStoreProducts,
  getAllSellerStoreProduct,
  getSingleSellerStoreProductById,
  getSellersStoreByProduct,
  getSingleProductAveragePrice,
  activeSellerStoreProduct,
  searchForRecommendProducts,
};
