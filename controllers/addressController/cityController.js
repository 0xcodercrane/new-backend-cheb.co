import asyncHandler from "express-async-handler";
import City from "#models/addressModel/addressCityModel.js"


const addCity = asyncHandler(async (req, res) => {
   
  const { state,name } = req.body;
  const stateAddress = await City.create({
    state,name
  });
  
  res.status(200).json(stateAddress);
});

const getAllCity = asyncHandler(async (req, res) => {
  const states = await City.find({state: req.params.id}).populate("state");
  res.status(200).json(states);
});

const getSingleCity = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const state = await City.findById(id)
    res.status(200).json(state)
})

const updateCity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await City.findByIdAndUpdate(id, {
      ...req.body,
    });
  
    const updatedCity = await City.findById(id);
  
    res.status(200).json(updatedCity);
});

const deleteCity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const state = await City.findById(id);
    if(!state){
        res.status(400)
        throw new Error("State not found")
    }

    const deleteState = await City.deleteOne({_id: id});
  
    res.status(200).json(deleteState);
});


export {
     addCity,
     getAllCity,
     updateCity,
     getSingleCity,
     deleteCity
     };
