import asyncHandler from "express-async-handler";
import Color from "#models/colorModel/colorModel.js";
import mongoose from "mongoose";

const addColor = asyncHandler(async (req, res) => {
  const { name, precedence, type } = req.body;
  const color = await Color.create({
    name,
    type,
    precedence,
  });

  res.status(200).json(color);
});

const getAllColor = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  let query = {};

  if (filter === "archive") {
    query.isArchive = true;
  } else if (filter === "active") {
    query.isArchive = false;
  }

  const colors = await Color.find(query).sort({ precedence: 1 });
  res.status(200).json(colors);
});

const getAllColorByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { search } = req.query;

  const query = {
    type,
    isArchive: false,
  };

  if (search) {
    query.name = { $regex: new RegExp(search), $options: "i" };
  }

  const colors = await Color.find(query).sort({
    precedence: 1,
  });

  res.status(200).json(colors);
});

const getAllColorWithProductId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find colors not associated with the given product ID
    const colorsNotAssociated = await Color.aggregate([
      {
        $match: {
          isArchive: false,
        },
      },
      {
        $lookup: {
          from: "productcolors", // Assuming your ProductColor model is named "ProductColor" and collection is named "productcolors"
          localField: "_id",
          foreignField: "color",
          as: "productColors",
        },
      },
      {
        $match: {
          productColors: {
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

    res.status(200).json(colorsNotAssociated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getSingleColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const state = await Color.findById(id);
  res.status(200).json(state);
});

const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Color.findByIdAndUpdate(id, {
    ...req.body,
  });

  const updatedColor = await Color.findById(id);

  res.status(200).json(updatedColor);
});

const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const color = await Color.findById(id);
  if (!Color) {
    res.status(400);
    throw new Error("Color not found");
  }

  const deleteColor = await Color.deleteOne({ _id: id });

  res.status(200).json(deleteColor);
});

const archiveColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const color = await Color.findById(id);
  if (!color) {
    res.status(400);
    throw new Error("Color not found");
  }

  await Color.findByIdAndUpdate(id, {
    ...req.body,
  });

  const updateStore = await Color.findById(id);
  res.status(200).json(updateStore);
});

export {
  addColor,
  getAllColor,
  updateColor,
  getSingleColor,
  deleteColor,
  getAllColorWithProductId,
  archiveColor,
  getAllColorByType,
};
