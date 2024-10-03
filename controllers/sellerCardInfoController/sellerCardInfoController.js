import asyncHandler from "express-async-handler";
import SellerCardInfo from "#models/sellerCardInfoModels/sellerCardInfoModels.js";

const setCardInfo = asyncHandler(async (req, res) => {
  let { paymentMethod } = req.body;

  let sellerCardInfoData = {seller: req.seller._id}

  if (paymentMethod == "credit-debit-card") {
    let { cardHolderName,  
      cardNumber,
      cardExpiryDate,
      cardCvv,
      cardBillingAddress,
      walletAddress
    } = req.body

    sellerCardInfoData = {
      ...sellerCardInfoData,
      cardHolderName,
      cardNumber,
      cardExpiryDate:{
        months: cardExpiryDate.split('/')[0] || "",
        years: cardExpiryDate.split('/')[1] || "",
      },
      cardCvv,
      cardBillingAddress,
      walletAddress,
      paymentMethod
    }
  }

  if (paymentMethod == "bank-account") {
    let {
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


    sellerCardInfoData = {
      ...sellerCardInfoData,
      bankName,
      accountHolderName,
      accountNumber,
      routingNumber,
      mobile,
      email,
      bankAddress,
      walletAddress,
      branchName,
      paymentMethod
    }
  }
  const sellerCardInfo = await SellerCardInfo.create(sellerCardInfoData);

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

  const updatedData = {
    ...req.body,
    ...(req.body.hasOwnProperty("cardExpiryDate") ? {
      cardExpiryDate: {
        months: req.body.cardExpiryDate.split('/')[0] || "",
        years: req.body.cardExpiryDate.split('/')[1] || ""
      }
    } : {})
  };
  await SellerCardInfo.findByIdAndUpdate(id, updatedData);

  const updateCardInfo = await SellerCardInfo.findById(id);
  res.status(200).json(updateCardInfo);
});

export { setCardInfo, getCardInfo, updateCardInfo, singleCardInfo };
