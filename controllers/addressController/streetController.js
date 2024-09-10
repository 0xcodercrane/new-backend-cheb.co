import asyncHandler from "express-async-handler";
import Street from "#models/addressModel/addressStreetModel.js"

const addStreet = asyncHandler(async (req, res) => {
   
  const { city,name } = req.body;
  const streets = await Street.create({
    city,name
  });
  
  res.status(200).json(streets);
});

const getAllStreet = asyncHandler(async (req, res) => {
  const streetss = await Street.find({city: req.params.id}).populate("city");
  res.status(200).json(streetss);
});

const getSingleStreet = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const street = await Street.findById(id)
    res.status(200).json(street)
})

const updateStreet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await Street.findByIdAndUpdate(id, {
      ...req.body,
    });
  
    const updatedStreet = await Street.findById(id);
  
    res.status(200).json(updatedStreet);
});

const deleteStreet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const street= await Street.findById(id);
    if(!street){
        res.status(400)
        throw new Error("State not found")
    }

    const deleteStreet = await Street.deleteOne({_id: id});
  
    res.status(200).json(deleteStreet);
});


export {addStreet,
    getAllStreet,
    getSingleStreet,
    updateStreet,
    deleteStreet
     };
