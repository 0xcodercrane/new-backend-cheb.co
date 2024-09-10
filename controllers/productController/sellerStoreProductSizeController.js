import asyncHandler from "express-async-handler";
import SellerStoreProductSize from "#models/productModel/sellerStoreProductSizeModel.js";
import ProductSize from "#models/sizeModel/productSizeModel.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import SellerRecommendation from "#models/productModel/upSellingProductModal.js";
// Adding sellerStoreProductSize
const addSellerStoreProductSize = asyncHandler(async (req, res) => {
  try {
    const productSizes = await ProductSize.find();
    const sellerStoreProducts = await SellerStoreProduct.find();

    const createdSellerStoreProductSizes = await Promise.all(
      productSizes.map(async (productSize) => {
        const sellerStoreProduct = sellerStoreProducts.find(
          (sellerStoreProduct) =>
            sellerStoreProduct.product.toString() ===
            productSize.product.toString()
        );

        if (sellerStoreProduct) {
          const sellerStoreProductSize = {
            sellerStoreProduct: sellerStoreProduct._id,
            size: productSize.size,
          };
          return await SellerStoreProductSize.create(sellerStoreProductSize);
        }
        return null;
      })
    );

    res.status(201).json(createdSellerStoreProductSizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const addSellerStoreProductSizeRetailCost = asyncHandler(async (req, res) => {
  try {
    // Find all SellerStoreProductSize and populate the sellerStoreProduct with product details
    const sellerStoreProductSizes =
      await SellerStoreProductSize.find().populate({
        path: "sellerStoreProduct",
        populate: {
          path: "product",
        },
      });

    const updatedSizes = await Promise.all(
      sellerStoreProductSizes.map(async (sellerStoreProductSize) => {
        const { sellerStoreProduct } = sellerStoreProductSize;
        if (
          sellerStoreProduct.product &&
          sellerStoreProduct.product.retailCost
        ) {
          return await SellerStoreProductSize.findByIdAndUpdate(
            sellerStoreProductSize._id,
            {
              retailCost: sellerStoreProduct.product.retailCost,
            },
            { new: true }
          );
        }
        return sellerStoreProductSize;
      })
    );

    res.status(200).json(updatedSizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// const addSellerStoreProductSizeRetailCost = asyncHandler(async (req, res) => {
//   const sellerStoreProducts = await SellerStoreProduct.find().populate('product');

//   sellerStoreProducts.map(async (sellerStoreProduct) => {
//     const addRetailCost = await SellerStoreProductSize.findByIdAndUpdate(sellerStoreProduct._id, {
//       retailCost: sellerStoreProduct.product.retailCost
//     });

//     res.status(200).json(addRetailCost);
//   });
// });

const getProductSizes = asyncHandler(async (req, res) => {
  const { gender, productId, storeId } = req.query;

  const sellerStoreProduct = await SellerStoreProduct.findOne({
    product: productId,
    sellerStore: storeId,
  });

  const query = { sellerStoreProduct: sellerStoreProduct._id };
  if (gender) {
    query.gender = gender;
  }

  const sizes = await SellerStoreProductSize.find(query)
    .populate("sellerStoreProduct")
    .populate("size");

  res.status(200).json(sizes);
});
const getSellerStoreProductSizesById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerStoreProductSizes = await SellerStoreProductSize.find({
    sellerStoreProduct: id,
  }).populate([
    {
      path: "sellerStoreProduct",
      populate: {
        path: "product",
      },
    },
    "size",
  ]);
  // const sellerStoreProductSizes = await SellerStoreProductSize.find({ sellerStoreProduct: id }).populate("sellerStoreProduct").populate("size");
  res.status(200).json(sellerStoreProductSizes);
});

const updateSellerStoreProductSize = asyncHandler(async (req, res) => {
  const {
    price,
    stock,
    size,
    sellerStoreProductId,
    recommendedItems,
    productCondition,
  } = req.body;

  console.log(productCondition, "productCondition");
  // console.log(price, "price");
  // console.log(size, "size");

  let updateProductConditionPromises = [];
  if (productCondition?.length > 0) {
    updateProductConditionPromises = productCondition.map((p) => {
      if (p) {
        return SellerStoreProductSize.findByIdAndUpdate(p._id, {
          productCondition: p.productCondition,
        });
      }
      return null;
    });
  }
  const updatedProductCondition = await Promise.all(
    updateProductConditionPromises
  );

  console.log(updatedProductCondition, "updatedProductCondition");
  let updatePromises = [];

  if (price?.length > 0) {
    updatePromises = price.map((p) => {
      if (p) {
        return SellerStoreProductSize.findByIdAndUpdate(p._id, {
          retailCost: parseInt(p.retailCost),
        });
      }
      return null;
    });
  }
  const updatedSizes = await Promise.all(updatePromises);

  let updateStockPromises = [];
  if (stock?.length > 0) {
    updateStockPromises = stock?.map((s) => {
      if (s) {
        return SellerStoreProductSize.findByIdAndUpdate(s._id, {
          stock: parseInt(s.stock),
        });
      }
      return null;
    });
  }
  const updatedStock = await Promise.all(updateStockPromises);

  console.log(updatedStock, "updatedStock");

  const newSizes = JSON.parse(size);

  console.log(newSizes, "newSizes");

  const sellerStoreProductSize = newSizes.map((size) => ({
    sellerStoreProduct: sellerStoreProductId,
    size: size.value,
    retailCost: parseInt(size.price),
    gender: size.gender,
    stock: parseInt(size.stock),
    productCondition: size.productCondition,
  }));

  const checkSize = await SellerStoreProductSize.insertMany(
    sellerStoreProductSize
  ); /*  */

  let newRecommend = [];

  if (recommendedItems) {
    newRecommend = JSON.parse(recommendedItems);
  }

  console.log(newRecommend, "newRecommend");

  const sellerRecommendation = newRecommend.map((item) => ({
    recommendedItem: item,
    sellerStoreProduct: sellerStoreProduct._id,
  }));

  console.log(sellerRecommendation, "sellerRecommendation");
  const recommended = await SellerRecommendation.insertMany(
    sellerRecommendation
  );

  console.log(checkSize, "new sellerStoreProductSize");

  res.status(200).json({ updatedSizes, updatedStock });
});

export {
  addSellerStoreProductSize,
  addSellerStoreProductSizeRetailCost,
  getProductSizes,
  getSellerStoreProductSizesById,
  updateSellerStoreProductSize,
};
