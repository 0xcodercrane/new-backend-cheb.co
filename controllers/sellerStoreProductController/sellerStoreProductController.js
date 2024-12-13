import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
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

//Working.
// const getAllSellerStoreProduct = asyncHandler(async (req, res) => {
//   try {
//     const { brand, gender, color, minPrice, maxPrice, condition, size, apparelSizes, search, type, category } = req.query;

//     const brandArray = Array.isArray(brand) ? brand : (brand ? JSON.parse(brand) : []);
//     const conditionArray = Array.isArray(condition) ? condition : (condition ? JSON.parse(condition) : []);
//     const sizeArray = Array.isArray(size) ? size : (size ? JSON.parse(size) : []);
//     const apparelSizeArray = Array.isArray(apparelSizes) ? apparelSizes : (apparelSizes ? JSON.parse(apparelSizes) : []);
//     const colorsArray = Array.isArray(color) ? color : (color ? JSON.parse(color) : []);

//     // Fetch latest non-archived stores
//     const stores = await SellerStore.find({ isArchive: false })
//       .sort({ createdAt: -1 })

//     const storeIds = stores.map(store => store._id);

//     // Helper function to fetch products based on type
//     // const fetchProducts = async (type) => {
//     //   const matchStage = {
//     //     isActive: true,
//     //     sellerStore: { $in: storeIds },
//     //     ...(type && { type }),
//     //     ...(search && {
//     //       "productDetails.name": { $regex: new RegExp(search.trim(), 'i') }
//     //     }),
//     //   };

//     //   return await SellerStoreProduct.aggregate([
//     //     { $match: matchStage },
//     //     {
//     //       $lookup: {
//     //         from: "products",
//     //         localField: "product",
//     //         foreignField: "_id",
//     //         as: "productDetails",
//     //       },
//     //     },
//     //     { $unwind: "$productDetails" },
//     //     { $match: { "productDetails.isArchive": false } },
//     //     {
//     //       $addFields: {
//     //         "productDetails.colorWay": {
//     //           $filter: {
//     //             input: "$productDetails.colorWay",
//     //             as: "colorId",
//     //             cond: {
//     //               $and: [
//     //                 { $eq: [{ $type: "$$colorId" }, "string"] },
//     //                 { $eq: [{ $strLenCP: "$$colorId" }, 24] }, // Ensure valid ObjectId length
//     //               ],
//     //             },
//     //           },
//     //         },
//     //       },
//     //     },
//     //     {
//     //       $addFields: {
//     //         "productDetails.colorWay": {
//     //           $map: {
//     //             input: "$productDetails.colorWay",
//     //             as: "colorId",
//     //             in: { $toObjectId: "$$colorId" }, // Convert to ObjectId
//     //           },
//     //         },
//     //       },
//     //     },
//     //     {
//     //       $lookup: {
//     //         from: "colors",
//     //         localField: "productDetails.colorWay",
//     //         foreignField: "_id",
//     //         as: "colorInfo",
//     //       },
//     //     },
//     //     {
//     //       $lookup: {
//     //         from: "sellerstoreproductsizes",
//     //         localField: "_id",
//     //         foreignField: "sellerStoreProduct",
//     //         as: "sizeDetails",
//     //       },
//     //     },
//     //     { $unwind: "$sizeDetails" },
//     //     {
//     //       $lookup: {
//     //         from: "sizes",
//     //         localField: "sizeDetails.size",
//     //         foreignField: "_id",
//     //         as: "sizeInfo",
//     //       },
//     //     },
//     //     { $unwind: "$sizeInfo" },
//     //     {
//     //       $match: {
//     //         ...(gender && { "sizeDetails.gender": { $regex: new RegExp(gender, 'i') } }),
//     //         ...(minPrice || maxPrice ? {
//     //           "productDetails.retailCost": {
//     //             ...(minPrice && { $gte: Number(minPrice) }),
//     //             ...(maxPrice && { $lte: Number(maxPrice) }),
//     //           },
//     //         } : {}),
//     //         ...(brandArray.length > 0 && {
//     //           $and: brandArray.map(b => ({
//     //             "productDetails.name": { $regex: new RegExp(b, 'i') },
//     //           })),
//     //         }),
//     //         ...(conditionArray.length > 0 && {
//     //           $and: conditionArray.map(con => ({
//     //             "sizeDetails.productCondition": { $regex: new RegExp(con, 'i') },
//     //           })),
//     //         }),
//     //         ...(sizeArray.length > 0 || apparelSizeArray.length > 0 ? {
//     //           $or: [
//     //             ...(sizeArray.length > 0
//     //               ? sizeArray.map(s => ({
//     //                 "sizeInfo.name": { $regex: new RegExp(s, 'i') },
//     //               }))
//     //               : []),
//     //             ...(apparelSizeArray.length > 0
//     //               ? apparelSizeArray.map(a => ({
//     //                 "sizeInfo.name": { $regex: new RegExp(a, 'i') },
//     //               }))
//     //               : []),
//     //           ],
//     //         } : {}),
//     //         ...(colorsArray.length > 0 && {
//     //           $or: colorsArray.map(c => ({
//     //             "productDetails.colorInfo.name": { $regex: new RegExp(c, 'i') },
//     //           })),
//     //         }),
//     //       },
//     //     },
//     //     {
//     //       $group: {
//     //         _id: "$productDetails._id",
//     //         sellerStore: { $first: "$sellerStore" },
//     //         productDetails: { $first: "$productDetails" },
//     //         sizes: { $push: "$sizeInfo" },
//     //         productConditions: { $push: "$sizeDetails.productCondition" },
//     //         colorInfo: { $first: "$productDetails.colorInfo" },
//     //         name: { $first: '$productDetails.name' },
//     //         cardImage: { $first: '$productDetails.cardImage' }
//     //       },
//     //     },
//     //     // Add this lookup to populate the sellerStore details
//     //     {
//     //       $lookup: {
//     //         from: "sellerstores", // The name of your seller stores collection
//     //         localField: "sellerStore",
//     //         foreignField: "_id",
//     //         as: "sellerStoreDetails",
//     //       },
//     //     },
//     //     { $unwind: "$sellerStoreDetails" }, // Unwind to make it a single document
//     //     {
//     //       $replaceRoot: {
//     //         newRoot: {
//     //           sellerStore: "$sellerStoreDetails",
//     //           product: "$productDetails",
//     //           sizes: "$sizes",
//     //           productConditions: "$productConditions",
//     //           colorInfo: "$colorInfo",
//     //           name: "$name",
//     //           cardImage: "$cardImage"
//     //         }
//     //       }
//     //     },
//     //     { $sort: { createdAt: -1 } },
//     //   ]);
//     // };

//     const fetchProducts = async (type) => {
//       const matchStage = {
//         isActive: true,
//         sellerStore: { $in: storeIds },
//         ...(type && { type }),
//         ...(search && {
//           "productDetails.name": { $regex: new RegExp(search.trim(), 'i') }
//         }),
//       };

//       return await SellerStoreProduct.aggregate([
//         { $match: matchStage },
//         {
//           $lookup: {
//             from: "products",
//             localField: "product",
//             foreignField: "_id",
//             as: "productDetails",
//           },
//         },
//         { $unwind: "$productDetails" },
//         { $match: { "productDetails.isArchive": false } },
//         {
//           $addFields: {
//             "productDetails.colorWay": {
//               $filter: {
//                 input: "$productDetails.colorWay",
//                 as: "colorId",
//                 cond: {
//                   $and: [
//                     { $eq: [{ $type: "$$colorId" }, "string"] },
//                     { $eq: [{ $strLenCP: "$$colorId" }, 24] }, // Ensure valid ObjectId length
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         {
//           $addFields: {
//             "productDetails.colorWay": {
//               $map: {
//                 input: "$productDetails.colorWay",
//                 as: "colorId",
//                 in: { $toObjectId: "$$colorId" }, // Convert to ObjectId
//               },
//             },
//           },
//         },
//         {
//           $lookup: {
//             from: "colors",
//             localField: "productDetails.colorWay",
//             foreignField: "_id",
//             as: "colorInfo",
//           },
//         },
//         {
//           $lookup: {
//             from: "sellerstoreproductsizes",
//             localField: "_id",
//             foreignField: "sellerStoreProduct",
//             as: "sizeDetails",
//           },
//         },
//         { $unwind: "$sizeDetails" },
//         {
//           $lookup: {
//             from: "sizes",
//             localField: "sizeDetails.size",
//             foreignField: "_id",
//             as: "sizeInfo",
//           },
//         },
//         { $unwind: "$sizeInfo" },
//         {
//           $match: {
//             ...(gender && { "sizeDetails.gender": { $regex: new RegExp(gender, 'i') } }),
//             ...(category && { "productDetails.category": { $regex: new RegExp(category, 'i') } }),
//             ...(minPrice || maxPrice ? {
//               "productDetails.retailCost": {
//                 ...(minPrice && { $gte: Number(minPrice) }),
//                 ...(maxPrice && { $lte: Number(maxPrice) }),
//               },
//             } : {}),
//             ...(brandArray.length > 0 && {
//               $and: brandArray.map(b => ({
//                 "productDetails.name": { $regex: new RegExp(b, 'i') },
//               })),
//             }),
//             ...(conditionArray.length > 0 && {
//               $and: conditionArray.map(con => ({
//                 "sizeDetails.productCondition": { $regex: new RegExp(con, 'i') },
//               })),
//             }),
//             ...(sizeArray.length > 0 || apparelSizeArray.length > 0 ? {
//               $or: [
//                 ...(sizeArray.length > 0
//                   ? sizeArray.map(s => ({
//                     "sizeInfo.name": { $regex: new RegExp(s, 'i') },
//                   }))
//                   : []),
//                 ...(apparelSizeArray.length > 0
//                   ? apparelSizeArray.map(a => ({
//                     "sizeInfo.name": { $regex: new RegExp(a, 'i') },
//                   }))
//                   : []),
//               ],
//             } : {}),
//             ...(colorsArray.length > 0 && {
//               $or: colorsArray.map(c => ({
//                 "colorInfo.name": { $regex: new RegExp(c, 'i') },
//               })),
//             }),
//           },
//         },
//         {
//           $group: {
//             _id: "$productDetails._id",
//             sellerStore: { $first: "$sellerStore" },
//             productDetails: { $first: "$productDetails" },
//             sizes: { $push: "$sizeInfo" },
//             productConditions: { $push: "$sizeDetails.productCondition" },
//             colorInfo: { $push: "$colorInfo" }, // Ensure colorInfo is an array
//             name: { $first: '$productDetails.name' },
//             cardImage: { $first: '$productDetails.cardImage' }
//           },
//         },
//         // Add this lookup to populate the sellerStore details
//         {
//           $lookup: {
//             from: "sellerstores", // The name of your seller stores collection
//             localField: "sellerStore",
//             foreignField: "_id",
//             as: "sellerStoreDetails",
//           },
//         },
//         { $unwind: "$sellerStoreDetails" }, // Unwind to make it a single document
//         {
//           $replaceRoot: {
//             newRoot: {
//               sellerStore: "$sellerStoreDetails",
//               product: "$productDetails",
//               sizes: "$sizes",
//               productConditions: "$productConditions",
//               colorInfo: "$colorInfo",
//               name: "$name",
//               cardImage: "$cardImage"
//             }
//           }
//         },
//         { $sort: { createdAt: -1 } },
//       ]);
//     };

//     // Fetch sneakers and apparel products
//     const [allProducts] = await Promise.all([
//       type ? fetchProducts(type) : fetchProducts()
//     ]);

//     res.status(200).json(allProducts);
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching products" });
//   }

// });

//

const getAllSellerStoreProduct = asyncHandler(async (req, res) => {
  try {
    const {
      brand,
      gender,
      color,
      minPrice,
      maxPrice,
      condition,
      size,
      apparelSizes,
      search,
      type,
      category,
      customerId,
      page = 1, // Default to page 1 if not provided
      limit = 12, // Default to 10 items per page
    } = req.query;

    const brandArray = Array.isArray(brand)
      ? brand
      : brand
      ? JSON.parse(brand)
      : [];
    const conditionArray = Array.isArray(condition)
      ? condition
      : condition
      ? JSON.parse(condition)
      : [];
    const sizeArray = Array.isArray(size) ? size : size ? JSON.parse(size) : [];
    const apparelSizeArray = Array.isArray(apparelSizes)
      ? apparelSizes
      : apparelSizes
      ? JSON.parse(apparelSizes)
      : [];
    const colorsArray = Array.isArray(color)
      ? color
      : color
      ? JSON.parse(color)
      : [];

    // Fetch latest non-archived stores
    const stores = await SellerStore.find({ isArchive: false }).sort({
      createdAt: -1,
    });
    const storeIds = stores.map((store) => store._id);

    // Helper function to fetch products based on type with pagination
    const fetchProducts = async (type, customerId) => {
      const matchStage = {
        isActive: true,
        sellerStore: { $in: storeIds },
        ...(type && { type }),
        ...(search && {
          "productDetails.name": { $regex: new RegExp(search.trim(), "i") },
        }),
      };
      console.log(matchStage);
      return await SellerStoreProduct.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        { $match: { "productDetails.isArchive": false } },
        {
          $addFields: {
            "productDetails.colorWay": {
              $filter: {
                input: "$productDetails.colorWay",
                as: "colorId",
                cond: {
                  $and: [
                    { $eq: [{ $type: "$$colorId" }, "string"] },
                    { $eq: [{ $strLenCP: "$$colorId" }, 24] }, // Ensure valid ObjectId length
                  ],
                },
              },
            },
          },
        },
        {
          $addFields: {
            "productDetails.colorWay": {
              $map: {
                input: "$productDetails.colorWay",
                as: "colorId",
                in: { $toObjectId: "$$colorId" }, // Convert to ObjectId
              },
            },
          },
        },
        {
          $lookup: {
            from: "colors",
            localField: "productDetails.colorWay",
            foreignField: "_id",
            as: "colorInfo",
          },
        },
        {
          $lookup: {
            from: "sellerstoreproductsizes",
            localField: "_id",
            foreignField: "sellerStoreProduct",
            as: "sizeDetails",
          },
        },
        { $unwind: "$sizeDetails" },
        {
          $lookup: {
            from: "sizes",
            localField: "sizeDetails.size",
            foreignField: "_id",
            as: "sizeInfo",
          },
        },
        { $unwind: "$sizeInfo" },
        // Join with favourites collection
        {
          $lookup: {
            from: "favourites", // Name of your favourites collection
            let: { productId: "$productDetails._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$product", "$$productId"] },
                      { $eq: ["$customerId", ObjectId(customerId)] },
                    ],
                  },
                },
              },
            ],
            as: "favouriteInfo",
          },
        },
        {
          $addFields: {
            isFavourite: { $gt: [{ $size: "$favouriteInfo" }, 0] }, // True if favouriteInfo array is not empty
          },
        },
        {
          $match: {
            ...(gender && {
              "sizeDetails.gender": { $regex: new RegExp(gender, "i") },
            }),
            ...(category && {
              "productDetails.category": { $regex: new RegExp(category, "i") },
            }),
            ...(minPrice || maxPrice
              ? {
                  "productDetails.retailCost": {
                    ...(minPrice && { $gte: Number(minPrice) }),
                    ...(maxPrice && { $lte: Number(maxPrice) }),
                  },
                }
              : {}),
            ...(brandArray.length > 0 && {
              $and: brandArray.map((b) => ({
                "productDetails.name": { $regex: new RegExp(b, "i") },
              })),
            }),
            ...(conditionArray.length > 0 && {
              $and: conditionArray.map((con) => ({
                "sizeDetails.productCondition": {
                  $regex: new RegExp(con, "i"),
                },
              })),
            }),
            ...(sizeArray.length > 0 || apparelSizeArray.length > 0
              ? {
                  $or: [
                    ...(sizeArray.length > 0
                      ? sizeArray.map((s) => ({
                          "sizeInfo.name": { $regex: new RegExp(s, "i") },
                        }))
                      : []),
                    ...(apparelSizeArray.length > 0
                      ? apparelSizeArray.map((a) => ({
                          "sizeInfo.name": { $regex: new RegExp(a, "i") },
                        }))
                      : []),
                  ],
                }
              : {}),
            ...(colorsArray.length > 0 && {
              $or: colorsArray.map((c) => ({
                "colorInfo.name": { $regex: new RegExp(c, "i") },
              })),
            }),
          },
        },
        {
          $group: {
            _id: "$productDetails._id",
            sellerStore: { $first: "$sellerStore" },
            productDetails: { $first: "$productDetails" },
            sizes: { $push: "$sizeInfo" },
            productConditions: { $push: "$sizeDetails.productCondition" },
            colorInfo: { $push: "$colorInfo" }, // Ensure colorInfo is an array
            name: { $first: "$productDetails.name" },
            retailCost: { $first: "$productDetails.retailCost" },
            cardImage: { $first: "$productDetails.cardImage" },
            isFavourite: { $first: "$isFavourite" },
          },
        },
        {
          $lookup: {
            from: "sellerstores",
            localField: "sellerStore",
            foreignField: "_id",
            as: "sellerStoreDetails",
          },
        },
        { $unwind: "$sellerStoreDetails" }, // Unwind to make it a single document
        {
          $replaceRoot: {
            newRoot: {
              sellerStore: "$sellerStoreDetails",
              product: "$productDetails",
              sizes: "$sizes",
              productConditions: "$productConditions",
              colorInfo: "$colorInfo",
              name: "$name",
              cardImage: "$cardImage",
              isFavourite: "$isFavourite",
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit, 10) },
      ]);
    };

    // Fetch sneakers and apparel products with pagination
    const [allProducts] = await Promise.all([
      type ? fetchProducts(type, customerId) : fetchProducts(null, customerId),
    ]);

    // res.status(200).json({ products: allProducts });
    res.status(200).json(allProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const getSellerStoreProducts = asyncHandler(async (req, res) => {
  const { filter, search } = req.query;
  const query = {};

  console.log("this end point calling");

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
