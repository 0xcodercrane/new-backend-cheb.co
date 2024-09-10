import asyncHandler from "express-async-handler";
import SellerCardInfo from "#models/sellerCardInfoModels/sellerCardInfoModels.js";

const setCardInfo = asyncHandler(async (req, res) => {
  const {
    bankName,
    accountHolderName,
    accountNumber,
    routingNumber,
    mobile,
    email,
    bankAddress,
    walletAddress,
    branchName,
  } = req.body;

  const sellerCardInfo = await SellerCardInfo.create({
    bankName,
    accountHolderName,
    accountNumber,
    routingNumber,
    mobile,
    email,
    bankAddress,
    seller: req.seller._id,
    walletAddress,
    branchName,
  });

  res.status(200).json(sellerCardInfo);
});

// const getCardInfo = asyncHandler(async(req,res)=>{
//     console.log("seller info is",req.seller._id)
//     const sellerCardInfo = await SellerCardInfo.findById({seller: req.seller._id}).populate("seller")
//     res.status(200).json(sellerCardInfo)
// })

const getCardInfo = asyncHandler(async (req, res) => {
  console.log("seller info is", req.seller._id);
  const sellerCardInfo = await SellerCardInfo.find({
    seller: req.seller._id,
  }).populate("seller");
  res.status(200).json(sellerCardInfo);
});
const singleCardInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerCardInfo = await SellerCardInfo.findById(id);
  res.status(200).json(sellerCardInfo);
});

const updateCardInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const oldCard = await SellerCardInfo.findById(id);

  if (!oldCard) {
    res.status(400);
    throw new Error("Card info not found");
  }

  await SellerCardInfo.findByIdAndUpdate(id, {
    ...req.body,
  });

  const updateCardInfo = await SellerCardInfo.findById(id);
  res.status(200).json(updateCardInfo);
});

export { setCardInfo, getCardInfo, updateCardInfo, singleCardInfo };
