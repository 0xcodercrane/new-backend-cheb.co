import asyncHandler from "express-async-handler";
import ProductSize from "#models/sizeModel/productSizeModel.js"


const addProductSize = asyncHandler(async (req, res) => {
  const { product,size } = req.body;
  const productSize = await ProductSize.create({
    product,size
  });
  
  res.status(200).json(productSize);
});

const getAllProductSize = asyncHandler(async (req, res) => {
  const productSizes = await ProductSize.find().populate("size");
  res.status(200).json(productSizes);
});

const getProductSizeByProductId = asyncHandler(async (req, res) => {
  const productSizes = await ProductSize.find({product: req.params.id}).populate("size");
  res.status(200).json(productSizes);
});

const getSingleProductSize = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const productSize = await ProductSize.findById(id).populate("size")
    res.status(200).json(productSize)
})

const updateProductSize = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await ProductSize.findByIdAndUpdate(id, {
      ...req.body,
    });
  
    const updatedproductSizeSize = await ProductSize.findById(id);
  
    res.status(200).json(updatedproductSizeSize);
});

const deleteProductSize = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const size = await ProductSize.findById(id);

    if(!size){
        res.status(400)
        throw new Error("Size not found")
    }

    const deleteSize = await ProductSize.deleteOne({_id: id});

    res.status(200).json({deletedCount: true});
});


export {
     addProductSize,
     getAllProductSize,
     updateProductSize,
     getSingleProductSize,
     deleteProductSize,
     getProductSizeByProductId
     };
