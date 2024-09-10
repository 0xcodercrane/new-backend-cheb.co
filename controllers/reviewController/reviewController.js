import asyncHandler from "express-async-handler";
import Review from "#models/reviewModel/reviewModel.js";
import { updateObject } from "../../config/space.js";

const getStoreReview = asyncHandler(async (req, res) => {
  const { store } = req.params;
  const storeReview = await Review.find({ store: store }).populate("customer");
  res.status(200).send(storeReview);
});

const getAverageRating = asyncHandler(async (req, res) => {
  console.log("get average rating");
  const { id } = req.params;

  const storeReview = await Review.find({
    store: id,
  });

  const totalRating = storeReview.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  // Calculate average
  let averageRating = 0;
  averageRating = (
    parseFloat(totalRating) / parseInt(storeReview.length)
  ).toFixed(1);

  if (isNaN(averageRating)) {
    averageRating = 0;
  }

  res.status(200).send({ averageRating, totalRating: storeReview.length });
});

const createReview = asyncHandler(async (req, res) => {
  // console.log("create review");
  const { store, rating, message, order } = req.body;

  if (!store || !rating || !message) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  // console.log(image);

  // if (!image) {
  //   res.status(400);
  //   throw new Error("Please add image");
  // }

  let imageUrl;
  if (req.files) {
    const { image } = req.files;
    imageUrl = `cheb/seller/store/${Date.now() + "-" + image.name}`;
    // console.log("1");
    await updateObject(imageUrl, image.data);
  }
  // console.log("2",req.user);

  const reviewData = {
    store,
    rating,
    message,
    image: req.files ? imageUrl : null,
    customer: req.customer._id,
    order,
  };

  const newReview = await Review.create(reviewData);
  console.log(newReview);

  res.status(201).json({
    success: true,
    data: newReview,
  });
});

export { getStoreReview, createReview, getAverageRating };
