import asyncHandler from "express-async-handler";
import moment from "moment";
import Product from "../../models/productModel/productModel.js";
import ProductImage from "../../models/productModel/productImageModel.js";
import OrderItem from "#models/orderModels/orderItemsModel.js";
import ProductSize from "#models/sizeModel/productSizeModel.js";
import ProductColor from "#models/colorModel/productColorModel.js";

import { deleteObject, uploadObject } from "../../config/space.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import Color from "#models/colorModel/colorModel.js";

//Get All products

async function ensureUniqueSlug(slug) {
  let uniqueSlug = slug;
  let counter = 1;

  while (await Product.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

const setProduct = asyncHandler(async (req, res) => {
  try {
    // Destructure request body
    const {
      name,
      slug: initialSlug,
      sku,
      description,
      colorWay,
      cardImage,
      productAllImage,
      type,
    } = req.body;

    JSON.stringify(colorWay);
    console.log(colorWay);
    // For creating Unique slug every product
    const slug = await ensureUniqueSlug(initialSlug);

    // Check for required images
    const hasCardImage = req.files?.cardImage || cardImage;
    const hasImages = req.files?.image || productAllImage;

    if (!hasCardImage || !hasImages) {
      return res
        .status(400)
        .json({ error: "Card image and product images are required." });
    }

    // Handle cardImage upload
    let cardImageUrl;

    if (req.files && req.files.cardImage) {
      const { cardImage } = req.files;
      cardImageUrl = `cheb/products/${Date.now() + "-" + cardImage.name}`;
      await uploadObject(cardImageUrl, cardImage.data);
    } else {
      cardImageUrl = cardImage;
    }

    // Handle image uploads
    const imageUrls = [];

    let images = req.files?.image;
    if (images && !Array.isArray(images)) {
      images = [images];
    }

    if (images) {
      for (const image of images) {
        const imageUrl = `cheb/products/${Date.now() + "-" + image.name}`;
        await uploadObject(imageUrl, image.data);
        imageUrls.push(imageUrl);
      }
    }

    // Create product
    const product = await Product.create({
      // sellerStore,
      name,
      slug,
      sku,
      description,
      cardImage: cardImageUrl,
      type,
      colorWay,
    });

    // Insert multiple product images
    if (imageUrls.length > 0) {
      const productImages = imageUrls.map((i) => ({
        image: i,
        product: product._id,
      }));
      await ProductImage.insertMany(productImages);
    }

    // Insert additional images from productAllImage
    if (productAllImage && productAllImage.length > 0) {
      const images =
        productAllImage &&
        productAllImage.length > 0 &&
        JSON.parse(productAllImage).map(({ _id, product, ...rest }) => rest);
      await ProductImage.insertMany(
        images.map((image) => ({ ...image, product: product._id }))
      );
    }

    // Respond with the created product
    console.log("Product created successfully", product);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error on creating product:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  const products = await Product.find();

  const paginatedProducts = products.slice(offset, offset + limit);

  res.status(200).json({
    products: paginatedProducts,
    totalProducts: products.length,
  });
});

const getAllProductByType = asyncHandler(async (req, res) => {
  const { type, limit = 10, page } = req.query;

  if (!page) {
    page = 1;
  }
  // console.log(page);
  const offset = (page - 1) * limit;
  // const sellerStoreProducts = await SellerStoreProduct.find();

  // const productIds = sellerStoreProducts.map((storeProduct) =>
  //   storeProduct.product.toString()
  // );

  const products = await Product.find({
    type: type,
    // _id: { $in: productIds },
  }).sort({ createdAt: -1 });

  const paginatedProducts = products.slice(offset, offset + limit);
  res.status(200).json({
    products: paginatedProducts,
    totalProducts: products.length,
    totalPage: Math.ceil(products.length / limit),
  });
});
const getNotAddedProductByType = asyncHandler(async (req, res) => {
  const { search, type, sellerStore } = req.query;

  const sellerStoreProducts = await SellerStoreProduct.find({ sellerStore });

  const productIds = sellerStoreProducts.map((storeProduct) =>
    storeProduct.product.toString()
  );

  const query = {
    type: type,
    _id: { $nin: productIds },
    isArchive: false,
  };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  const notSellerStoreProducts = await Product.find(query);

  res.status(200).json({
    products: notSellerStoreProducts,
    totalProducts: notSellerStoreProducts.length,
  });
});

const getAllStoreProduct = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, storeId } = req.query;
  let query = { isArchive: false };

  if (search) {
    query.name = { $regex: new RegExp(search, "i") };
  }

  try {
    let products = await Product.find(query);
    // .skip((page - 1) * limit)
    // .limit(Number(limit))
    // .exec();

    products = products.filter(
      (product) => product.sellerStore.toString() === storeId.toString()
    );

    res.status(200).json(products);
  } catch (err) {
    console.error("Error:", err); // Debugging the error
    res.status(500).json({ error: err.message });
  }
});

const getSellerStoreProductsByType = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, storeId, type } = req.query;
  let query = { isArchive: false };

  console.log(storeId, type);
  if (search) {
    query.name = { $regex: new RegExp(search, "i") };
  }

  try {
    let products = await SellerStoreProduct.find(query).populate("product");

    products.sort((a, b) => a.product.name.localeCompare(b.product.name));

    products = products.filter(
      (product) => product.sellerStore.toString() === storeId.toString()
    );

    if (type) {
      products = products.filter((product) => product.type === type);
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error:", err); // Debugging the error
    res.status(500).json({ error: err.message });
  }
});

const getSingleProductAllItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = await Product.findById(id);
  const productImages = await ProductImage.find({
    product: id,
    isArchive: false,
  });
  const productColors = await ProductColor.find({
    product: id,
    isArchive: false,
  });
  const productSizes = await ProductSize.find({
    product: id,
    isArchive: false,
  });

  res
    .status(200)
    .json({ productData, productImages, productColors, productSizes });
});

const getAllProductsForConsumer = asyncHandler(async (req, res) => {
  const { search, sortBy, type } = req.query;

  let query = { isArchive: false }; // Filter for non-archived products by default
  let sortOptions = { createdAt: -1 }; // Default sorting by createdAt descending

  if (search) {
    query.name = { $regex: new RegExp(search, "i") }; // Case-insensitive search by product name
  }

  if (type) {
    query.type = type; // Filter by product type
  }

  if (sortBy) {
    if (sortBy === "oldest") {
      sortOptions = { createdAt: 1 }; // Sort by createdAt ascending
    } else if (sortBy === "priceLowToHigh") {
      sortOptions = { retailCost: 1 }; // Sort by retailCost ascending
    } else if (sortBy === "priceHighToLow") {
      sortOptions = { retailCost: -1 }; // Sort by retailCost descending
    }
  }

  try {
    let products;

    // Aggregate to ensure that products have entries in both ProductColor and ProductSize collections
    products = await SellerStoreProduct.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "productcolors",
          localField: "_id",
          foreignField: "product",
          as: "productColors",
        },
      },
      {
        $lookup: {
          from: "productsizes",
          localField: "_id",
          foreignField: "product",
          as: "productSizes",
        },
      },
      {
        $match: {
          $and: [
            { productColors: { $ne: [] } }, // Ensure product has at least one color
            { productSizes: { $ne: [] } }, // Ensure product has at least one size
          ],
        },
      },
      {
        $sort: sortOptions, // Apply sorting
      },
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

const getAllTrendingProducts = asyncHandler(async (req, res) => {
  try {
    // Calculate the date 10 days ago
    const startDate = moment().subtract(10, "days").toDate();

    // Find orders within the last 10 days
    const orders = await OrderItem.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$item", // Group by item (product)
          totalSold: { $count: {} }, // Count the occurrences of each product ID
        },
      },
      {
        $sort: { totalSold: -1 }, // Sort by totalSold in descending order
      },
      {
        $limit: 10, // Limit to the top 10 products
      },
      {
        $lookup: {
          from: "products", // Collection name for the Product model
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);

    // Respond with the trending products
    res.json({ success: true, trendingProducts: orders });
  } catch (err) {
    console.error("Error finding trending products:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

const getSingleStoreProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const storeProducts = await SellerStoreProduct.find({
    sellerStore: id,
    isActive: true,
  }).populate({
    path: "product",
  });

  const activeStoreProducts = storeProducts.filter(
    (storeProduct) => storeProduct.product !== null
  );
  const products = activeStoreProducts.map(
    (storeProduct) => storeProduct.product
  );

  const activeProducts = products.filter(
    (product) => product?.isArchive === false
  );

  res.status(200).json(activeProducts);
});

const getSingleStoreProductForSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { filter } = req.query;
  let query = {};

  if (filter === "archive") {
    query.isArchive = true;
  } else if (filter === "active") {
    query.isArchive = false;
  }

  const storeProducts = await Product.find({
    ...query,
    sellerStore: id,
  });

  res.status(200).json(storeProducts);
});

const getSingleStoreProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  console.log(slug);
  const singleStoreProducts = await Product.find({ slug }).populate(
    "sellerStore"
  );
  // console.log(singleStoreProducts);
  res.status(200).json(singleStoreProducts);
});

const getFeaturedApparel = asyncHandler(async (req, res) => {
  console.log("Api Hit");

  const products = await SellerStoreProduct.find({
    type: "apparel",
  })
    .populate("product")
    .populate("sellerStore");

  // console.log(products);
  // console.log(products);
  res.status(200).json(products);
});

const getTrendingSneaker = asyncHandler(async (req, res) => {
  const products = await SellerStoreProduct.find({
    type: "sneaker",
  })
    .populate("product")
    .populate("sellerStore");

  // console.log(products);
  // console.log(products);
  res.status(200).json(products);
});

// Get Single product
const getSingleProduct = asyncHandler(async (req, res) => {
  console.log("Api Hit");
  const { id } = req.params;
  const singleProduct = await Product.findById(id);

  let colorIds;
  if (singleProduct.colorWay.length > 0) {
    colorIds = JSON.parse(singleProduct.colorWay[0]);
  }
  const colors = await Color.find({ _id: { $in: colorIds } });

  res.status(200).json({ singleProduct, colors });
});

const getSingleProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const singleP = await Product.findOne({ slug });

  res.status(200).json(singleP);
});

const updateSingleProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateProduct = await Product.findById(id);

    const colorWay = JSON.stringify(req.body.colorWay);

    let data = { ...req.body, colorWay };

    if (updateProduct.isArchive) {
      data = { ...req.body, isArchive: false };
    } else {
      data = { ...req.body, isArchive: true };
    }

    if (!updateProduct) {
      res.status(400);
      throw new Error("Product not Found");
    }

    let cardImage, images;
    if (req.files) {
      cardImage = req.files.cardImage;
      images = req.files.image;
    }

    async function uploadImages(images, id) {
      const imageUrls = [];
      if (!Array.isArray(images)) {
        images = [images];
      }
      for (const image of images) {
        const imageUrl = `cheb/products/${Date.now()}-${image.name}`;
        await uploadObject(imageUrl, image.data);
        imageUrls.push(imageUrl);
      }
      const productImages = imageUrls.map((i) => ({ image: i, product: id }));
      await ProductImage.insertMany(productImages);
    }

    if (!cardImage && !images) {
      await Product.findByIdAndUpdate(id, data);
    } else {
      if (cardImage) {
        const cardImageUrl = `cheb/products/${Date.now()}-${cardImage.name}`;
        await uploadObject(cardImageUrl, cardImage.data);
        await Product.findByIdAndUpdate(id, {
          cardImage: cardImageUrl,
          ...req.body,
        });
      }

      if (images) {
        await uploadImages(images, id);
      }
    }

    const updatedProduct = await Product.findById(id);

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(400);
    throw new Error("Product not Found");
  }

  await deleteObject(product.cardImage);
  console.log("delete card image successfully");
  const productImages = await ProductImage.find({ product: id });
  for (const productImage of productImages) {
    console.log("Deleted every images", productImage);
    await deleteObject(productImage.image);
  }
  await product.remove();
  await ProductImage.deleteMany({ product: id });

  res.status(200).json({ deletedCount: true });
});

const archiveProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  await Product.findByIdAndUpdate(id, {
    ...req.body,
  });

  const updateStore = await Product.findById(id);
  res.status(200).json(updateStore);
});

const totalProducts = asyncHandler(async (req, res) => {
  const totalProducts = await Product.estimatedDocumentCount();
  res.status(200).json(totalProducts);
});

export {
  getAllProduct,
  getSingleProductAllItem,
  setProduct,
  getSingleProduct,
  updateSingleProduct,
  deleteProduct,
  getSingleProductBySlug,
  getAllProductsForConsumer,
  getSingleStoreProduct,
  getSingleStoreProductBySlug,
  getAllTrendingProducts,
  archiveProduct,
  getSingleStoreProductForSeller,
  totalProducts,
  getAllStoreProduct,
  getFeaturedApparel,
  getAllProductByType,
  getSellerStoreProductsByType,
  getTrendingSneaker,
  getNotAddedProductByType,
};
