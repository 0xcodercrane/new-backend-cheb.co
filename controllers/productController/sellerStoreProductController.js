import Product from "#models/productModel/productModel.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";
import asyncHandler from "express-async-handler";
import { uploadObject } from "../../config/space.js";
import ProductImage from "#models/productModel/productImageModel.js";
import SellerStoreProductSize from "#models/productModel/sellerStoreProductSizeModel.js";
import SellerRecommendation from "#models/productModel/upSellingProductModal.js";
import ProductRequestModel from "#models/productModel/productRequest.js";

async function ensureUniqueSlug(slug) {
  let uniqueSlug = slug;
  let counter = 1;

  while (await Product.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

//  adding sellerStoreProduct
const addSellerStoreProduct = asyncHandler(async (req, res) => {
  const products = await Product.find();

  const createdSellerStoreProducts = await Promise.all(
    products.map(async (product) => {
      const sellerStoreProduct = {
        sellerStore: product.sellerStore,
        product: product._id,
        type: product.type,
      };
      return await SellerStoreProduct.create(sellerStoreProduct);
    })
  );

  res.status(201).json(createdSellerStoreProducts);
});

const createApparel = asyncHandler(async (req, res) => {
  // Destructure request body
  const {
    name,
    slug: initialSlug,
    cardImage,
    sku,
    description,
    colorWay,
    productAllImage,
    type,
    storeId,
    size,
    recommendedItems,
  } = req.body;

  //? For creating Unique slug every product
  const slug = await ensureUniqueSlug(initialSlug);

  // Check for required images
  const hasCardImage = req.files?.cardImage;
  const hasImages = req.files?.image;

  if (!hasCardImage) {
    return res.status(400).json({ error: "Card image  is required." });
  }
  if (!hasImages) {
    return res.status(400).json({ error: " Product images are required." });
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

  //? Insert additional images from productAllImage
  if (productAllImage && productAllImage.length > 0) {
    const images =
      productAllImage &&
      productAllImage.length > 0 &&
      JSON.parse(productAllImage).map(({ _id, product, ...rest }) => rest);
    await ProductImage.insertMany(
      images.map((image) => ({ ...image, product: product._id }))
    );
  }

  if (product) {
    //  Create Seller Store Product

    const sellerStoreProduct = {
      sellerStore: storeId,
      product: product._id,
      type: product.type,
    };
    const createdSellerStoreProduct = await SellerStoreProduct.create(
      sellerStoreProduct
    );

    // Seller Store Product Size
    const newSizes = JSON.parse(size);
    const sellerStoreProductSize = newSizes.map((size) => ({
      sellerStoreProduct: createdSellerStoreProduct._id,
      size: size.value,
      retailCost: size.price,
      gender: size.gender,
    }));
    await SellerStoreProductSize.insertMany(sellerStoreProductSize);

    //* Seller Recommendation
    console.log(recommendedItems, "recommendedItems");

    let newRecommend = [];

    if (recommendedItems) {
      newRecommend = JSON.parse(recommendedItems);
    }

    const sellerRecommendation = newRecommend.map((item) => ({
      recommendedItem: item,
      sellerStoreProduct: createdSellerStoreProduct._id,
    }));

    const recommended = await SellerRecommendation.insertMany(
      sellerRecommendation
    );
    console.log(recommended, "recommended");

    res.status(201).json({ product });
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

const productRequests = asyncHandler(async (req, res) => {

  const { productDescription } = req.body;
  try {
    
    // Create product request
    const productRequest = await ProductRequestModel.create({
      description:productDescription,
      requestedBy : req.seller
    });
    res.status(201).json({ productRequest });

  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });

  }




});

const getProductRequests = asyncHandler(async (req, res) => {
  try {
    // Create product request
    const productRequest = await ProductRequestModel.find().sort({createdAt:-1});
    res.status(200).json({ status:200,
      message:"fetch product reqest successfully",
      data:productRequest
     });

  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });

  }
});

const getProductRequestsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const getProductRequest = await ProductRequestModel.findOne({ _id: id });
  res.status(200).json(getProductRequest);
});


const updatedProduRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedProduRequest = await ProductRequestModel.findByIdAndUpdate({ _id: id }, {description:req.body.productDescription});
  res.status(200).json(updatedProduRequest);
});

export { addSellerStoreProduct, createApparel, productRequests, getProductRequests, getProductRequestsById, updatedProduRequest };
