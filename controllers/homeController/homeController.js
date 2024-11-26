import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import Product from "#models/productModel/productModel.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import ProductSize from "#models/sizeModel/productSizeModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import asyncHandler from "express-async-handler";
import { json } from "express";

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
    const { brand, gender, color, minPrice, maxPrice, condition, size, apparelSizes, category, search } = req.query;

    const brandArray = Array.isArray(brand) ? brand : (brand ? JSON.parse(brand) : []);
    const conditionArray = Array.isArray(condition) ? condition : (condition ? JSON.parse(condition) : []);
    const sizeArray = Array.isArray(size) ? size : (size ? JSON.parse(size) : []);
    const apparelSizeArray = Array.isArray(apparelSizes) ? apparelSizes : (apparelSizes ? JSON.parse(apparelSizes) : []);
    const colorsArray = Array.isArray(color) ? color : (color ? JSON.parse(color) : []);
    const searchQuery = search ? search.trim() : "";

    console.log("brandArray",brandArray, typeof search, search)

    // Fetch latest non-archived stores
    const stores = await SellerStore.find({ isArchive: false })
      .sort({ createdAt: -1 })
      .limit(10);

    const storeIds = stores.map(store => store._id);

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
    //     $group: {
    //       _id: "$sellerStoreDetails._id",
    //       sellerStore: { $first: "$sellerStoreDetails" }
    //     },
    //   },
    //   // Flatten sellerStore data
    //   {
    //     $replaceRoot: { newRoot: "$sellerStore" }
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

    console.log("search",search)
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
            { "sellerStoreDetails.name": { $regex: searchQuery, $options: "i" } },
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
        $replaceRoot: { newRoot: "$sellerStore" }
        // $replaceRoot: { newRoot: { $mergeObjects: ["$sellerStore", "$seller"] } }
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
        // Apply filters based on query parameter.
        {
          $match: {
            ...(search && {
              $or: [
                { "productDetails.name": { $regex: searchQuery, $options: "i" } },
                { "productDetails.category": { $regex: searchQuery, $options: "i" } },
                { "productDetails.colorInfo.name": { $regex: searchQuery, $options: "i" } },
                { "sizeInfo.name": { $regex: searchQuery, $options: "i" } },
                { "productDetails.retailCost": { $eq: Number(search) } }, 
              ],
            }),
            // Gender filter (exact match, no $or needed)
            ...(gender && { "sizeDetails.gender": { $regex: new RegExp(gender, 'i') } }),

            // Price range filter (retailCost should be within minPrice and maxPrice)
            ...(minPrice || maxPrice ? {
              "productDetails.retailCost": {
                ...(minPrice && { $gte: Number(minPrice) }),
                ...(maxPrice && { $lte: Number(maxPrice) }),
              },
            } : {}),

            ...(category && { "productDetails.category": { $regex: new RegExp(category, 'i') } }),

            // Brand filter (match exact brands, all brand conditions must match)
            ...(brandArray.length > 0 && {
              $and: brandArray.map(b => ({
                "productDetails.name": { $regex: new RegExp(b, 'i') },
              })),
            }),

            // Condition filter (match product conditions, all conditions must match)
            ...(conditionArray.length > 0 && {
              $and: conditionArray.map(con => ({
                "sizeDetails.productCondition": { $regex: new RegExp(con, 'i') },
              })),
            }),

            // Size and Apparel Size filters (combine sizeArray and apparelSizeArray using OR)
            ...(sizeArray.length > 0 || apparelSizeArray.length > 0 ? {
              $or: [
                ...(sizeArray.length > 0
                  ? sizeArray.map(s => ({
                    "sizeInfo.name": { $regex: new RegExp(s, 'i') },
                  }))
                  : []),
                ...(apparelSizeArray.length > 0
                  ? apparelSizeArray.map(a => ({
                    "sizeInfo.name": { $regex: new RegExp(a, 'i') },
                  }))
                  : []),
              ],
            } : {}), // Only include $or if either sizeArray or apparelSizeArray has elements

            // Color filter (match any of the provided colors)
            ...(colorsArray.length > 0 && {
              $or: colorsArray.map(c => ({
                "productDetails.colorInfo.name": { $regex: new RegExp(c, 'i') },
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
            name: { $first: '$productDetails.name' },
            cardImage: { $first: '$productDetails.cardImage' },
            slug:{$first:'$productDetails.slug'},
            sellerStore:{$first:'$productDetails.sellerStore'}


          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    };

    // Fetch sneakers and apparel products
    const [sneakers, apparel, allProducts] = await Promise.all([
      fetchProducts("sneaker"),
      fetchProducts("apparel"),
      fetchProducts()
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
    const {search } = req.query;
    const searchQuery = search ? search.trim() : "";

    // Fetch latest non-archived stores
    const stores = await SellerStore.find({ isArchive: false })
      .sort({ createdAt: -1 })
      .limit(10);

    const storeIds = stores.map(store => store._id);

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
            { "sellerStoreDetails.name": { $regex: searchQuery, $options: "i" } },
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
        $replaceRoot: { newRoot: "$sellerStore" }
        // $replaceRoot: { newRoot: { $mergeObjects: ["$sellerStore", "$seller"] } }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
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
        // Apply filters based on query parameter.
        {
          $match: {
            ...(search && {
              $or: [
                { "productDetails.name": { $regex: searchQuery, $options: "i" } },
                { "productDetails.category": { $regex: searchQuery, $options: "i" } },
                { "productDetails.colorInfo.name": { $regex: searchQuery, $options: "i" } },
                { "sizeInfo.name": { $regex: searchQuery, $options: "i" } },
                { "productDetails.retailCost": { $eq: Number(search) } }, 
              ],
            }),
          },
        },
        
        
        {
          $group: {
            _id: "$productDetails._id",
            product_name: { $first: "$productDetails.name" },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
    };

    // Fetch sneakers and apparel products
    const [sneakers, apparel, allProducts] = await Promise.all([
      fetchProducts("sneaker"),
      fetchProducts("apparel"),
      fetchProducts()
    ]);

    // Construct the home data response
    const homeData = {
      stores: uniqueStores,
      sneakers,
      apparel,
      products: allProducts,
    };

    const allData = [...homeData.stores, ...homeData.sneakers, ...homeData.apparel, ...homeData.products];
    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



export { getHomePageData, getHomePageSearchData };
