import Product from "#models/productModel/productModel.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import asyncHandler from "express-async-handler";

const getHomePageData = asyncHandler(async (req, res) => {
  try {
    const stores = await SellerStore.find({ isArchive: false })
      .sort({ createdAt: -1 })
      .limit(10);

    const storeIds = stores.map((store) => store._id);

    const products = await SellerStoreProduct.find({
      isActive: true,
      sellerStore: { $in: storeIds },
    })
      .populate("sellerStore")
      .populate("product");

    const activeProducts = products.filter(
      (product) => product.product.isArchive === false
    );

    let uniqueStores = [];
    activeProducts.forEach((product) => {
      if (!uniqueStores.includes(product.sellerStore)) {
        uniqueStores.push(product.sellerStore);
      }
    });

    const allProducts = await SellerStoreProduct.find({ isActive: true })
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(6);

    const sneakers = await SellerStoreProduct.find({
      type: "sneaker",
      isActive: true,
    })
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(6);

    const apparel = await SellerStoreProduct.find({
      type: "apparel",
      isActive: true,
    })
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(6);

    // Function to filter out duplicate products
    const getUniqueProducts = (products) => {
      const seenProducts = new Set();
      return products.filter((product) => {
        const productId = product._id.toString();
        if (seenProducts.has(productId)) {
          return false;
        }
        seenProducts.add(productId);
        return true;
      });
    };

    // Filter unique products
    const sneakerProducts = getUniqueProducts(
      sneakers.map((sneaker) => sneaker.product)
    );

    console.log(sneakerProducts);

    let activeSneakers = sneakerProducts.filter(
      (product) => product.isArchive === false
    );

    const apparelProducts = getUniqueProducts(
      apparel.map((apparel) => apparel.product)
    );
    const productList = getUniqueProducts(
      allProducts.map((product) => product.product)
    );

    const homeData = {
      stores: uniqueStores,
      sneakers: activeSneakers,
      apparel: apparelProducts,
      products: productList,
    };

    res.status(200).json(homeData);
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { getHomePageData };
