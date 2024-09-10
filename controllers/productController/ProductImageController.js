import asyncHandler from "express-async-handler";
import ProductImage from "#models/productModel/productImageModel.js";
import { deleteObject } from "#config/space.js";

const getSingleProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productImages = await ProductImage.find({ product: id });
  res.status(200).json(productImages);
});

// Delete Product
const deleteProductImage = asyncHandler(async (req, res) => {
  const productImage = await ProductImage.findById(req.params.id);
  // console.log(productImage);
  if (!productImage) {
    res.status(400);
    throw new Error("ProductImage not Found");
  }

  await deleteObject(productImage.image);
  await productImage.remove();
  res.status(200).json({ deletedCount: true });
});

export { getSingleProductImages, deleteProductImage };
