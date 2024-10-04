import asyncHandler from "express-async-handler";
import Seller from "#models/userModels/sellerModel/sellerModel.js"


//Update Wallet Address
export const sellerWalletAddressUpdate = asyncHandler(async (req,res) => {
    const {walletAddress } = req.body;
    if(!walletAddress){
        return res.status(400).json({ status: 400, message: "Invalid Id or Wallet Address!!"});
    }
    const updatedData = await Seller.findByIdAndUpdate({_id: req.seller.id}, { walletAddress }, {
        new: true
    })

    res.status(200).json({
        status: 200,
        message: "Wallet Address Updated Successfully",
        data: updatedData?.walletAddress

    })

})