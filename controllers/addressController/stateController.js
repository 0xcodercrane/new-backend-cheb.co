import asyncHandler from "express-async-handler";
import State from "#models/addressModel/addressStateModel.js";

const addState = asyncHandler(async (req, res) => {
  
  const { name } = req.body;
  const stateAddress = await State.create({
    name: name,
  });

  res.status(200).json(stateAddress);
});

const getAllStateAddress = asyncHandler(async (req, res) => {
  const states = await State.find();
  res.status(200).json(states);
});

const getSingleStateAddress = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const state = await State.findById(id)
    res.status(200).json(state)
})

const updateStateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updateState = await State.findById(id);
    if(!updateState){
      res.status(400)
      throw new Error("State not found")
    }

    await State.findByIdAndUpdate(id, {
      ...req.body,
    });
  
    const updatedState = await State.findById(id);
  
    res.status(200).json(updatedState);
});

const deleteStateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const state = await State.findById(id);
    if(!state){
        res.status(400)
        throw new Error("State not found")
    }

    const deleteState = await State.deleteOne({_id: id});
  
    res.status(200).json(deleteState);
});




export {
     addState,
     getAllStateAddress,
     updateStateAddress,
     getSingleStateAddress,
     deleteStateAddress
     };
