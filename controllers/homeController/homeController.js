import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import Product from "#models/productModel/productModel.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import ProductSize from "#models/sizeModel/productSizeModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import asyncHandler from "express-async-handler";
import { json } from "express";
import customerModel from "#models/userModels/customerModel/customerModel.js";
import { StatusCodes } from "http-status-codes";
import { ResponseMessage } from "#controllers/utils/ResponseMessage.js";
import NotificationModel from "#models/notificationModel/notificationModel.js";

// const getHomePageData = asyncHandler(async (req, res) => {
//   try {
//     const stores = await SellerStore.find({ isArchive: false })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     const storeIds = stores.map((store) => store._id);

//     const products = await SellerStoreProduct.find({
//       isActive: true,
//       sellerStore: { $in: storeIds },
//     })
//       .populate("sellerStore")
//       .populate("product");

//     const activeProducts = products.filter(
//       (product) => product.product.isArchive === false
//     );

//     let uniqueStores = [];
//     activeProducts.forEach((product) => {
//       if (!uniqueStores.includes(product.sellerStore)) {
//         uniqueStores.push(product.sellerStore);
//       }
//     });

//     const allProducts = await SellerStoreProduct.find({ isActive: true })
//       .populate("product")
//       .sort({ createdAt: -1 })
//       .limit(6);

//     const sneakers = await SellerStoreProduct.find({
//       type: "sneaker",
//       isActive: true,
//     })
//       .populate("product")
//       .sort({ createdAt: -1 })
//       .limit(6);

//     const apparel = await SellerStoreProduct.find({
//       type: "apparel",
//       isActive: true,
//     })
//       .populate("product")
//       .sort({ createdAt: -1 })
//       .limit(6);

//     // Function to filter out duplicate products
//     const getUniqueProducts = (products) => {
//       const seenProducts = new Set();
//       return products.filter((product) => {
//         const productId = product._id.toString();
//         if (seenProducts.has(productId)) {
//           return false;
//         }
//         seenProducts.add(productId);
//         return true;
//       });
//     };

//     // Filter unique products
//     const sneakerProducts = getUniqueProducts(
//       sneakers.map((sneaker) => sneaker.product)
//     );

//     console.log(sneakerProducts);

//     let activeSneakers = sneakerProducts.filter(
//       (product) => product.isArchive === false
//     );

//     const apparelProducts = getUniqueProducts(
//       apparel.map((apparel) => apparel.product)
//     );
//     const productList = getUniqueProducts(
//       allProducts.map((product) => product.product)
//     );

//     const homeData = {
//       stores: uniqueStores,
//       sneakers: activeSneakers,
//       apparel: apparelProducts,
//       products: productList,
//     };

//     res.status(200).json(homeData);
//   } catch (error) {
//     console.error("Error fetching home page data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

const getHomePageData = asyncHandler(async (req, res) => {
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
      category,
      search,
      customerId,
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
    const searchQuery = search ? search.trim() : "";

    console.log("brandArray", brandArray, typeof search, search);

    // Fetch latest non-archived stores
    const stores = await SellerStore.find({ isArchive: false })
      .sort({ createdAt: -1 })
      .limit(10);

    const storeIds = stores.map((store) => store._id);

    const uniqueStores = await SellerStoreProduct.aggregate([
      {
        $lookup: {
          from: "sellerstores",
          localField: "sellerStore",
          foreignField: "_id",
          as: "sellerStoreDetails",
        },
      },
      { $unwind: "$sellerStoreDetails" },
      {
        $match: {
          "sellerStoreDetails.isArchive": false,
          isActive: true,
        },
      },
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
        $group: {
          _id: "$sellerStoreDetails._id",
          sellerStore: { $first: "$sellerStoreDetails" },
        },
      },
      // Flatten sellerStore data
      {
        $replaceRoot: { newRoot: "$sellerStore" },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          seller: 1,
          name: 1,
          slug: 1,
          email: 1,
          mobile: 1,
          city: 1,
          state: 1,
          zipCode: 1,
          street: 1,
          image: 1,
          bannerImage: 1,
          coordinates: 1,
          startTime: 1,
          endTime: 1,
          isArchive: 1,
          isVerified: 1,
          permittedToSellApparel: 1,
          type: 1,
        },
      },
    ]);

    uniqueStores.map(async (store) => {
      // Check if the store is in favourites for the current customer
      const favourite = await mongoose.model("Favourite").findOne({
        store: store._id, // Match store ID
        customerId: ObjectId(customerId), // Match the logged-in customer ID
      });

      // Add the 'isFavourite' field to the store
      store.isFavourite = favourite ? true : false;

      return store; // Return the updated store object
    });

    // const uniqueStores = await SellerStoreProduct.aggregate([
    //   {
    //     $lookup: {
    //       from: "sellerstores",
    //       localField: "sellerStore",
    //       foreignField: "_id",
    //       as: "sellerStoreDetails",
    //     },
    //   },
    //   { $unwind: "$sellerStoreDetails" },
    //   {
    //     $match: {
    //       "sellerStoreDetails.isArchive": false,
    //       isActive: true,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "product",
    //       foreignField: "_id",
    //       as: "productDetails",
    //     },
    //   },
    //   { $unwind: "$productDetails" },
    //   { $match: { "productDetails.isArchive": false } },
    //   {
    //     $lookup: {
    //       from: "sellers", // Assuming the collection name is 'sellers'
    //       localField: "sellerStoreDetails.seller", // Adjust field name as needed
    //       foreignField: "_id",
    //       as: "sellerDetails",
    //     },
    //   },
    //   { $unwind: "$sellerDetails" },
    //   {
    //     $match: {
    //       "sellerDetails.isArchive": false, // Ensure seller is not archived
    //     },
    //   },
    //   // $regex: new RegExp(search, "i") }
    //   // {
    //   //   $match: {
    //   //     $or: [
    //   //       { "sellerStoreDetails.name": { $regex: searchQuery, $options: "i" } },
    //   //     ],
    //   //   },
    //   // },

    //   {
    //     $group: {
    //       _id: "$sellerStoreDetails._id",
    //       sellerStore: { $first: "$sellerStoreDetails" },
    //       // seller: { $first: "$sellerDetails" }, // Get seller details
    //     },
    //   },
    //   // Flatten sellerStore and seller data
    //   {
    //     $replaceRoot: { newRoot: "$sellerStore" }
    //     // $replaceRoot: { newRoot: { $mergeObjects: ["$sellerStore", "$seller"] } }
    //   },
    //   { $sort: { createdAt: -1 } },
    //   { $limit: 10 },
    //   {
    //     $project: {
    //       _id: 1,
    //       seller: 1,
    //       name: 1,
    //       slug: 1,
    //       email: 1,
    //       mobile: 1,
    //       city: 1,
    //       state: 1,
    //       zipCode: 1,
    //       street: 1,
    //       image: 1,
    //       bannerImage: 1,
    //       coordinates: 1,
    //       startTime: 1,
    //       endTime: 1,
    //       isArchive: 1,
    //       isVerified: 1,
    //       permittedToSellApparel: 1,
    //       type: 1,
    //     },
    //   },
    // ]);

    // Helper function to fetch products based on type
    const fetchProducts = async (type, customerId) => {
      return await SellerStoreProduct.aggregate([
        {
          $match: {
            ...(type && { type }),
            isActive: true,
            sellerStore: { $in: storeIds },
          },
        },
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
        // Convert valid strings to ObjectIds
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
          $addFields: {
            "productDetails.colorInfo": "$colorInfo",
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
        // Apply filters based on query parameter.
        {
          $match: {
            // ...(search && {
            //   $or: [
            //     { "productDetails.name": { $regex: searchQuery, $options: "i" } },
            //     { "productDetails.category": { $regex: searchQuery, $options: "i" } },
            //     { "productDetails.colorInfo.name": { $regex: searchQuery, $options: "i" } },
            //     { "sizeInfo.name": { $regex: searchQuery, $options: "i" } },
            //     { "productDetails.retailCost": { $eq: Number(search) } },
            //   ],
            // }),
            // Gender filter (exact match, no $or needed)
            ...(gender && {
              "sizeDetails.gender": { $regex: new RegExp(gender, "i") },
            }),

            // Price range filter (retailCost should be within minPrice and maxPrice)
            ...(minPrice || maxPrice
              ? {
                  "productDetails.retailCost": {
                    ...(minPrice && { $gte: Number(minPrice) }),
                    ...(maxPrice && { $lte: Number(maxPrice) }),
                  },
                }
              : {}),

            ...(category && {
              "productDetails.category": { $regex: new RegExp(category, "i") },
            }),

            // Brand filter (match exact brands, all brand conditions must match)
            ...(brandArray.length > 0 && {
              $and: brandArray.map((b) => ({
                "productDetails.name": { $regex: new RegExp(b, "i") },
              })),
            }),

            // Condition filter (match product conditions, all conditions must match)
            ...(conditionArray.length > 0 && {
              $and: conditionArray.map((con) => ({
                "sizeDetails.productCondition": {
                  $regex: new RegExp(con, "i"),
                },
              })),
            }),

            // Size and Apparel Size filters (combine sizeArray and apparelSizeArray using OR)
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
              : {}), // Only include $or if either sizeArray or apparelSizeArray has elements

            // Color filter (match any of the provided colors)
            ...(colorsArray.length > 0 && {
              $or: colorsArray.map((c) => ({
                "productDetails.colorInfo.name": { $regex: new RegExp(c, "i") },
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
            colorInfo: { $first: "$productDetails.colorInfo" },
            name: { $first: "$productDetails.name" },
            retailCost: { $first: "$productDetails.retailCost" },
            cardImage: { $first: "$productDetails.cardImage" },
            slug: { $first: "$productDetails.slug" },
            sellerStore: { $first: "$productDetails.sellerStore" },
            isFavourite: { $first: "$isFavourite" },
          },
        },
        // { $sort: { createdAt: -1 } },
        // { $limit: 10 },
      ]);
    };
    console.log(customerId, "customerId306");
    // Fetch sneakers and apparel products
    const [sneakers, apparel, allProducts] = await Promise.all([
      fetchProducts("sneaker", customerId),
      fetchProducts("apparel", customerId),
      fetchProducts(null, customerId),
    ]);

    // Construct the home data response
    const homeData = {
      stores: uniqueStores,
      sneakers,
      apparel,
      products: allProducts,
    };

    res.status(200).json(homeData);
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getHomePageSearchData = asyncHandler(async (req, res) => {
  try {
    const { search } = req.query;
    const searchQuery = search ? search.trim() : "";
    console.log(searchQuery, 472);

    // Fetch latest non-archived stores
    const stores = await SellerStore.find({ isArchive: false })
      .sort({ createdAt: -1 })
      .limit(5);

    const storeIds = stores.map((store) => store._id);

    const uniqueStores = await SellerStoreProduct.aggregate([
      {
        $lookup: {
          from: "sellerstores",
          localField: "sellerStore",
          foreignField: "_id",
          as: "sellerStoreDetails",
        },
      },
      { $unwind: "$sellerStoreDetails" },
      {
        $match: {
          "sellerStoreDetails.isArchive": false,
          isActive: true,
        },
      },
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
        $lookup: {
          from: "sellers", // Assuming the collection name is 'sellers'
          localField: "sellerStoreDetails.seller", // Adjust field name as needed
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: "$sellerDetails" },
      {
        $match: {
          "sellerDetails.isArchive": false, // Ensure seller is not archived
        },
      },
      // $regex: new RegExp(search, "i") }
      {
        $match: {
          $or: [
            {
              "sellerStoreDetails.name": { $regex: searchQuery, $options: "i" },
            },
          ],
        },
      },

      {
        $group: {
          _id: "$sellerStoreDetails._id",
          sellerStore: { $first: "$sellerStoreDetails" },
          // seller: { $first: "$sellerDetails" }, // Get seller details
        },
      },
      // Flatten sellerStore and seller data
      {
        $replaceRoot: { newRoot: "$sellerStore" },
        // $replaceRoot: { newRoot: { $mergeObjects: ["$sellerStore", "$seller"] } }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          seller: 1,
          name: 1,
        },
      },
    ]);

    // Helper function to fetch products based on type
    const fetchProducts = async (type) => {
      return await SellerStoreProduct.aggregate([
        {
          $match: {
            ...(type && { type }),
            isActive: true,
            sellerStore: { $in: storeIds },
          },
        },
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
        // Convert valid strings to ObjectIds
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
          $addFields: {
            "productDetails.colorInfo": "$colorInfo",
          },
        },
        // Apply filters based on query parameter.
        {
          $match: {
            ...(search && {
              $or: [
                // { "productDetails.name": { $regex: `^${searchQuery}$`, $options: "i" } },
                {
                  "productDetails.name": {
                    $regex: `^${searchQuery}`,
                    $options: "i",
                  },
                },
                {
                  "productDetails.category": {
                    $regex: searchQuery,
                    $options: "i",
                  },
                },
                {
                  "productDetails.colorInfo.name": {
                    $regex: searchQuery,
                    $options: "i",
                  },
                },
                { "sizeInfo.name": { $regex: searchQuery, $options: "i" } },
                { "productDetails.retailCost": { $eq: Number(search) } },
              ],
            }),
          },
        },

        {
          $group: {
            _id: { $substr: ["$productDetails.name", 0, 5] }, // Group by the first 5 characters of the name
            product_name: { $first: "$productDetails.name" }, // Include the first product name in the group
            product_id: { $first: "$productDetails._id" },
            product_cardImage: { $first: "$productDetails.cardImage" },
            _id: "$productDetails._id",
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
      ]);
    };

    // Fetch sneakers and apparel products
    const [sneakers, apparel, allProducts] = await Promise.all([
      fetchProducts("sneaker"),
      fetchProducts("apparel"),
      fetchProducts(),
    ]);

    // Construct the home data response
    const homeData = {
      stores: uniqueStores,
      sneakers,
      apparel,
      products: allProducts,
    };

    const allData = [
      ...homeData.stores,
      ...homeData.sneakers,
      ...homeData.apparel,
      ...homeData.products,
    ];
    const limitedData = allData.slice(0, 5);
    const uniqueProducts = [];
    const seenProductIds = new Set();

    limitedData.forEach((item) => {
      const productId =
        item.product_id !== undefined
          ? item?.product_id.toString()
          : item?._id.toString();
      if (!seenProductIds.has(productId)) {
        uniqueProducts.push(item);
        seenProductIds.add(productId);
      }
    });
    res.status(200).json(uniqueProducts);
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getSearchListData = asyncHandler(async (req, res) => {
  try {
    const { search, tabName } = req.query;
    const searchQuery = search ? search.trim() : "";

    console.log("searchQuery", searchQuery);

    // Fetch latest non-archived stores
    const stores = await SellerStore.find({ isArchive: false })
      .sort({ createdAt: -1 })
      .limit(5);

    const storeIds = stores.map((store) => store._id);

    const uniqueStores = await SellerStoreProduct.aggregate([
      {
        $lookup: {
          from: "sellerstores",
          localField: "sellerStore",
          foreignField: "_id",
          as: "sellerStoreDetails",
        },
      },
      { $unwind: "$sellerStoreDetails" },
      {
        $match: {
          "sellerStoreDetails.isArchive": false,
          isActive: true,
        },
      },
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
        $lookup: {
          from: "sellers",
          localField: "sellerStoreDetails.seller",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: "$sellerDetails" },
      {
        $match: {
          "sellerDetails.isArchive": false,
        },
      },
      {
        $match: {
          $or: [
            // { "sellerStoreDetails.name": `^${searchQuery.slice(0, 3)}$`, $options: "i" }
            //  $regex: `^${searchQuery.slice(0, 3)}`,
            // `^${searchQuery}{3}$`,

            {
              "sellerStoreDetails.name": { $regex: searchQuery, $options: "i" },
            },
          ],
        },
      },

      {
        $group: {
          _id: "$sellerStoreDetails._id",
          sellerStore: { $first: "$sellerStoreDetails" },
          // seller: { $first: "$sellerDetails" }, // Get seller details
        },
      },
      // Flatten sellerStore and seller data
      {
        $replaceRoot: { newRoot: "$sellerStore" },
        // $replaceRoot: { newRoot: { $mergeObjects: ["$sellerStore", "$seller"] } }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          seller: 1,
          name: 1,
        },
      },
    ]);

    // Helper function to fetch products based on type
    const fetchProducts = async (type) => {
      return await SellerStoreProduct.aggregate([
        {
          $match: {
            ...(type && { type }),
            isActive: true,
            sellerStore: { $in: storeIds },
          },
        },
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
        // Convert valid strings to ObjectIds
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
          $addFields: {
            "productDetails.colorInfo": "$colorInfo",
          },
        },

        // Apply filters based on query parameter.
        {
          $match: {
            ...(search && {
              $or: [
                {
                  "productDetails.name": {
                    $regex: `^${searchQuery}`,
                    $options: "i",
                  },
                },
                // { "productDetails.category": { $regex: searchQuery, $options: "i" } },
                // { "productDetails.colorInfo.name": { $regex: searchQuery, $options: "i" } },
                // { "productDetails.retailCost": { $eq: Number(search) } },
              ],
            }),
          },
        },
        {
          $group: {
            _id: "$productDetails._id",
            product_name: { $first: "$productDetails.name" },
            cardImage: { $first: "$productDetails.cardImage" },
            retailCost: { $first: "$productDetails.retailCost" },
            slug: { $first: "$productDetails.slug" },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    };

    // Fetch sneakers and apparel products
    const [sneakers, apparel, allProducts] = await Promise.all([
      fetchProducts("sneaker"),
      fetchProducts("apparel"),
      fetchProducts(),
    ]);

    // Construct the home data response
    const homeData = {
      stores: uniqueStores,
      sneakers,
      apparel,
      products: allProducts,
    };

    const allData = [
      ...homeData.stores,
      ...homeData.sneakers,
      ...homeData.apparel,
      ...homeData.products,
    ];

    let finalData = [];
    switch (tabName) {
      case "1":
        finalData = allData.filter((data) => data.product_name !== undefined);
        break;
      case "2":
        finalData = allData.filter((data) => data.seller !== undefined);
        break;
      case "3":
        finalData = allData
          .filter(
            (data) => data.retailCost !== undefined && data.retailCost !== null
          )
          .sort((a, b) => a.retailCost - b.retailCost);
        break;
      case "4":
        finalData = allData
          .filter(
            (data) => data.retailCost !== undefined && data.retailCost !== null
          )
          .sort((a, b) => b.retailCost - a.retailCost);
        break;
      default:
        finalData = allData;
        break;
    }

    const uniqueProducts = [];
    const seenProductIds = new Set();

    finalData.forEach((item) => {
      const _id =
        item._id !== undefined ? item?._id.toString() : item?._id.toString();
      if (!seenProductIds.has(_id)) {
        uniqueProducts.push(item);
        seenProductIds.add(_id);
      }
    });

    res.status(200).json(uniqueProducts);
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getNotifications = async (req, res) => {
  try {
    const { customerId } = req.query;
    console.log("customerId", customerId);
    if (!customerId) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.USER_NOT_EXIST,
        data: null,
      });
    }

    let findCustomer = await customerModel.findOne({ _id: customerId });

    if (!findCustomer) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.USER_NOT_EXIST,
        data: null,
      });
    }

    const query = {
      isDeleted: false,
      customerId: findCustomer?._id,
    };
    const notificationLists = await NotificationModel.find(query)
      .populate("customerId", "name email image")
      .populate("orderId")
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(notificationLists);
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export {
  getHomePageData,
  getHomePageSearchData,
  getSearchListData,
  getNotifications,
};
