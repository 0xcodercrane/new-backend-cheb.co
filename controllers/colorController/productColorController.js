import asyncHandler from "express-async-handler";
import ProductColor from "#models/colorModel/productColorModel.js"


const addProductColor = asyncHandler(async (req, res) => {
  const { product,color, colorWay } = req.body;
  const productColor = await ProductColor.create({
    product,color,colorWay
});
  
  res.status(200).json(productColor);
});

const getAllProductColor = asyncHandler(async (req, res) => {
  const productColors = await ProductColor.find().populate("color");
  res.status(200).json(productColors);
});

const getProductColorByProductId = asyncHandler(async (req, res) => {
  const productColors = await ProductColor.find({product: req.params.id}).populate("color");
  res.status(200).json(productColors);
});

const getSingleProductColor = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const productColor = await ProductColor.findById(id).populate("color")
    res.status(200).json(productColor)
})


const updateProductColor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await ProductColor.findByIdAndUpdate(id, {
      ...req.body,
    });
  
    const updatedProductColorcolor = await ProductColor.findById(id);
  
    res.status(200).json(updatedProductColorcolor);
});

const deleteProductColor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const color = await ProductColor.findById(id);

    if(!color){
        res.status(400)
        throw new Error("color not found")
    }

    const deletecolor = await ProductColor.deleteOne({_id: id});

    res.status(200).json({deletedCount: true});
});


export {
     addProductColor,
     getAllProductColor,
     updateProductColor,
     getSingleProductColor,
     deleteProductColor,
     getProductColorByProductId
     };
