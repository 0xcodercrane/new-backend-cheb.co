import AdminProductModel from "#models/productModel/adminProductModel.js";
import ProductImage from "#models/productModel/productImageModel.js";
import { uploadObject } from "../../config/space.js";
import asyncHandler from "express-async-handler";

async function ensureUniqueSlug(slug) {
  let uniqueSlug = slug;
  let counter = 1;

  while (await AdminProductModel.findOne({ slug: uniqueSlug })) {
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
      colorWay,
      sku,
      cardImage,
      description,
      retailCost,
      type,
      isActive,
      productAllImage,
    } = req.body;

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
    const product = await AdminProductModel.create({
      name,
      slug,
      sku,
      retailCost,
      description,
      colorWay,
      cardImage: cardImageUrl,
      type,
      isActive,
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

    console.log(product);
    // Respond with the created product
    res.status(200).json(product);
  } catch (error) {
    console.error("Error on creating product:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  const products = await AdminProductModel.find();
  res.status(200).json(products);
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await AdminProductModel.findById(req.params.id);
  res.status(200).json(product);
});

export { setProduct, getAllProduct, getSingleProduct };
