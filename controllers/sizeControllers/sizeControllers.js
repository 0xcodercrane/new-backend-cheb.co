import asyncHandler from "express-async-handler";
import Size from "#models/sizeModel/sizeModel.js";
import mongoose from "mongoose";

const addSize = asyncHandler(async (req, res) => {
  const { name, precedence, type, gender } = req.body;
  const size = await Size.create({
    name,
    precedence,
    type,
    gender,
  });

  res.status(200).json(size);
});

const getAllSize = asyncHandler(async (req, res) => {
  const { filter, type } = req.query;
  let query = {};

  if (filter === "archive") {
    query.isArchive = true;
  } else if (filter === "active") {
    query.isArchive = false;
  }

  const sizes = await Size.find(query).sort({ precedence: 1 });
  res.status(200).json(sizes);
});

const getAllSizeByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const sizes = await Size.find({ type, isArchive: false }).sort({
    precedence: 1,
  });

  console.log(sizes);
  res.status(200).json(sizes);
});

const getAllSizeByTypeAndGender = asyncHandler(async (req, res) => {
  const { type, gender, search } = req.query;

  const query = {
    type,
    gender,
    isArchive: false,
  };

  if (search) {
    query.name = { $regex: new RegExp(search, "i") }; // Case-insensitive search by product name
  }
  const sizes = await Size.find(query);
  res.status(200).json(sizes);
});

const getAllSizeByProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find colors not associated with the given product ID
    const productsNotAssociated = await Size.aggregate([
      {
        $match: {
          isArchive: false,
        },
      },
      {
        $lookup: {
          from: "productsizes", // Assuming your ProductColor model is named "ProductColor" and collection is named "productcolors"
          localField: "_id",
          foreignField: "size",
          as: "productSizes",
        },
      },
      {
        $match: {
          productSizes: {
            $not: { $elemMatch: { product: mongoose.Types.ObjectId(id) } },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          precedence: 1,
        },
      },
    ]);

    res.status(200).json(productsNotAssociated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getSingleSize = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const state = await Size.findById(id);
  res.status(200).json(state);
});

const updateSize = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Size.findByIdAndUpdate(id, {
    ...req.body,
  });

  const updatedSize = await Size.findById(id);

  res.status(200).json(updatedSize);
});

const archiveSize = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const size = await Size.findById(id);

  if (!size) {
    res.status(400);
    throw new Error("Size not found");
  }

  await Size.findByIdAndUpdate(id, {
    ...req.body,
  });

  const updatedSize = await Size.findById(id);
  res.status(200).json(updatedSize);
});

const deleteSize = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const size = await Size.findById(id);
  if (!size) {
    res.status(400);
    throw new Error("Size not found");
  }

  const deleteSize = await Size.deleteOne({ _id: id });

  res.status(200).json(deleteSize);
});

export {
  addSize,
  getAllSize,
  updateSize,
  getSingleSize,
  deleteSize,
  getAllSizeByProduct,
  archiveSize,
  getAllSizeByType,
  getAllSizeByTypeAndGender,
};
