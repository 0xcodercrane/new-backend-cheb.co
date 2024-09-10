
import asyncHandler from "express-async-handler";
import PaymentToSeller from "#models/paymentToSellerModel/paymentToSellerModel.js"


const addPaymentToSeller = asyncHandler(async(req,res)=>{
    const {dateOfPayment,seller,amount} = req.body;
    if(!dateOfPayment || !seller || !amount) {
        res.status(400);
        throw new Error("Please add all field")
    }
    const paymentToSeller = await PaymentToSeller.create({
        dateOfPayment,
        seller,
        amount,
        createdBy: req.employee._id,
      });

      res.status(200).json(paymentToSeller)
})


const getAllPaymentToSeller = asyncHandler(async(req,res)=>{
    const allPaymentToSeller = await PaymentToSeller.find()
    .populate("seller")
    .populate("createdBy");
    res.status(200).json(allPaymentToSeller)
})


const getSinglePaymentToSeller = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const sinlgePaymentToSeler = await PaymentToSeller.findById(id);
    res.status(200).json(sinlgePaymentToSeler)
})

const totalPaymentToSeller = asyncHandler(async (req, res) => {
    PaymentToSeller.aggregate([
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" }
            }
        }
    ])
    .exec((err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error occurred while calculating total amount");
            return;
        }
        const roundedTotalAmount = Math.round(result[0].totalAmount); // Round the totalAmount
        res.json({ totalAmount: roundedTotalAmount });
    });
});

const getAllsinglePaymentToSeller = asyncHandler(async(req,res)=>{
    const id= req.seller._id;
    const paymentToSeller = await PaymentToSeller.find(id).populate("seller")
    const paymentApprovalCount = await PaymentToSeller.countDocuments({seller:id,isApprove:false})
    res.status(200).json({paymentToSeller,paymentApprovalCount})
})

const updatePaymentToSeller = asyncHandler(async(req,res)=>{
    const {id}= req.params;
    const oldPaymenToSellerDetails = await PaymentToSeller.findById(id)
    if(!oldPaymenToSellerDetails) {
        res.status(400)
        throw new Error("Payment to seller info not found")
    }

    await PaymentToSeller.findByIdAndUpdate(id,{
        ...req.body,
        seller:req.seller._id
    })

    const updatePaymentToSeller = await PaymentToSeller.find(id)
    res.status(200).json(updatePaymentToSeller)
})


export {
    getAllPaymentToSeller,
    addPaymentToSeller,
    getSinglePaymentToSeller,
    totalPaymentToSeller,
    getAllsinglePaymentToSeller,
    updatePaymentToSeller
};
