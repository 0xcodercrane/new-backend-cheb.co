import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import moment from "moment-timezone";

import Seller from "#models/userModels/sellerModel/sellerModel.js";
import Product from "#models/productModel/productModel.js";
import SellerStore from "#models/userModels/sellerModel/sellerStoreModel/sellerStoreModel.js";
import { uploadObject } from "#config/space.js";
import { updateObject } from "#config/space.js";
import { deleteObject } from "#config/space.js";
import SellerStoreProduct from "#models/productModel/sellerStoreProductModel.js";

const { verify } = jwt;

const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validateTimeFormat = (time) => {
  return timeFormat.test(time);
};

// add store
const addStore = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    mobile,
    city,
    state,
    street,
    zipCode,
    slug,
    coordinates,
    type,
    startTime,
    endTime,
    timezone,
  } = req.body;

  //  for image
  if (!req.files) {
    res.status(400);
    throw new Error("Please add Image");
  }

  const { image, bannerImage } = req.files;

  const imgUrl = `cheb/seller/store/${
    Date.now() + "-" + image.name.replace(/\s+/g, "").trim()
  }`;
  const bannerImgUrl = `cheb/seller/store/banner/${
    Date.now() + "-" + image.name.replace(/\s+/g, "").trim()
  }`;

  await uploadObject(imgUrl, image.data);
  await uploadObject(bannerImgUrl, bannerImage.data);

  // cheking is seller present or not
  const sellerExist = await Seller.findOne({ _id: req.seller.id });

  if (!sellerExist) {
    res.status(400);
    throw new Error("Seller Is Not Found!!");
  }

  console.log(state, "state");

  moment.tz(startTime, "HH:mm", timezone);
  moment.tz(endTime, "HH:mm", timezone);

  // console.log(openTime, closeTime, "time");

  const addStore = await SellerStore.create({
    seller: req.seller.id,
    name,
    email,
    city,
    street,
    state,
    zipCode,
    mobile,
    slug,
    image: imgUrl,
    bannerImage: bannerImgUrl,
    coordinates,
    type,
    startTime,
    endTime,
    timezone,
  });

  if (addStore) {
    res.status(201).json({
      seller: addStore.seller,
      _id: addStore.id,
      name: addStore.name,
      email: addStore.email,
      mobile: addStore.mobile,
      city: addStore.city,
      state: addStore.state,
      street: addStore.street,
      zipCode: addStore.zipCode,
      coordinates: addStore.coordinates,
      bannerImage: addStore.bannerImage,
      slug: addStore.slug,
      image: addStore.imgUrl,
      isArchive: addStore.isArchive,
      isVerified: addStore.isVerified,
      startTime: addStore.startTime,
      endTime: addStore.endTime,
      // token: token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Seller Data");
  }
});

// get store

const getAllStore = asyncHandler(async (req, res) => {
  const stores = await SellerStore.find({ isArchive: false }).sort({
    createdAt: -1,
  });
  res.status(200).send(stores);
});




const getAllStoreByType = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { isArchive: false };

  if (type) {
    query.type = type;
  }

  if (type === "Independent Reseller") {
    query.isPermittedToSellApparel = true;
  }

  let stores = [];

  stores = await SellerStore.find(query).sort({
    createdAt: -1,
  });

  console.log(stores, "stores");

  const storeIds = stores.map((store) => store._id);

  const products = await SellerStoreProduct.find({
    isActive: true,
    sellerStore: { $in: storeIds },
  }).populate("sellerStore");

  let uniqueStores = [];
  products.forEach((product) => {
    if (!uniqueStores.includes(product.sellerStore)) {
      uniqueStores.push(product.sellerStore);
    }
  });

  res.status(200).send(uniqueStores);
});

const getSingleStoreBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const store = await SellerStore.findOne({ slug: slug, isArchive: false });
  // console.log(store);
  res.status(200).send(store);
});

const getSellerAllStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stores = await SellerStore.find({ seller: id });

  res.status(200).json(stores);
});

const totalStores = asyncHandler(async (req, res) => {
  const totalStores = await SellerStore.estimatedDocumentCount();
  res.status(200).json(totalStores);
});

const getSellerAllStoresById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { filter } = req.query;
  let query = {};

  if (filter === "archive") {
    query.isArchive = true;
  } else if (filter === "active") {
    query.isArchive = false;
  }

  const stores = await SellerStore.find({ ...query, seller: id }).populate(
    "seller"
  );
  res.status(200).json(stores);
});

const getSellerSingleStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const store = await SellerStore.findById(id).populate("seller");
  res.status(200).json(store);
});

const updateStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const oldStore = await SellerStore.findById(id);

  if (!oldStore) {
    res.status(400);
    throw new Error("Store not found");
  }
  if (!req.files) {
    await SellerStore.findByIdAndUpdate(id, {
      ...req.body,
    });
  }

  // if have image
  if (req.files.image && !req.files.bannerImage) {
    const { image } = req.files;
    const imageUrl = `cheb/seller/store/${
      Date.now() + "-" + image.name.replace(/\s+/g, "").trim()
    }`;
    await updateObject(imageUrl, image.data, oldStore.image);
    const uploadImageUrl = imageUrl;

    await SellerStore.findByIdAndUpdate(req.params.id, {
      image: uploadImageUrl,
      ...req.body,
    });
  }

  // if have image
  if (!req.files.image && req.files.bannerImage) {
    const { bannerImage } = req.files;

    const bannerImageUrl = `cheb/seller/banner/store/${
      Date.now() + "-" + bannerImage.name.replace(/\s+/g, "").trim()
    }`;

    console.log(bannerImageUrl.trim(), "bannerImageUrl");

    await updateObject(
      bannerImageUrl,
      bannerImage.data,
      updateStore.bannerImage
    );
    const uploadBannerImageUrl = bannerImageUrl;

    await SellerStore.findByIdAndUpdate(req.params.id, {
      bannerImage: uploadBannerImageUrl,
      ...req.body,
    });
  }

  if (req.files.image && req.files.bannerImage) {
    const { image, bannerImage } = req.files;

    const bannerImageUrl = `cheb/seller/banner/store/${
      Date.now() + "-" + bannerImage.name
    }`;
    await updateObject(
      bannerImageUrl,
      bannerImage.data,
      updateStore.bannerImage
    );
    const uploadBannerImageUrl = bannerImageUrl;

    const imageUrl = `cheb/seller/store/${Date.now() + "-" + image.name}`;
    await updateObject(imageUrl, image.data, updateStore.image);
    const uploadImageUrl = imageUrl;

    await SellerStore.findByIdAndUpdate(req.params.id, {
      bannerImage: uploadBannerImageUrl,
      image: uploadImageUrl,
      ...req.body,
    });
  }

  // await SellerStore.findByIdAndUpdate(id, {
  //   ...req.body,
  // });

  const updatedStore = await SellerStore.findById(id);

  res.status(200).json(updatedStore);
});

const archiveStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isArchive } = req.body;

  const store = await SellerStore.findById(id);
  if (!store) {
    res.status(400);
    throw new Error("Store not found");
  }
  await SellerStore.findByIdAndUpdate(id, req.body);

  await Product.updateMany({ sellerStore: id }, { isArchive });

  const updatedStore = await SellerStore.findById(id);
  res.status(200).json(updatedStore);
});

const deleteStore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const store = SellerStore.findById(id);

  if (!store) {
    res.status(400);
    throw new Error("Store not found");
  }
  const products = Product.find({ sellerStore: id });

  if (products.length > 0) {
    products.map(async (product) => {
      await deleteObject(product.image);
    });
  }
  await deleteObject(store.image);

  await store.deleteOne();

  await Product.deleteMany({ sellerStore: id });
  res.status(200).json({ deletedCount: true });
});

const permittedToSellApparel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const store = await SellerStore.findById(id);

  if (!store) {
    res.status(400);
    throw new Error("Store not found");
  }

  const permission = store.permittedToSellApparel ? false : true;

  console.log(permission, "permission");

  const result = await SellerStore.findByIdAndUpdate(id, {
    permittedToSellApparel: permission,
  });

  // console.log(result);

  const updatedStore = await SellerStore.findById(id);

  console.log(updatedStore);
  res.status(200).json(updatedStore);
});

export {
  addStore,
  getAllStore,
  getSellerAllStore,
  getSellerSingleStore,
  updateStore,
  deleteStore,
  archiveStore,
  getSellerAllStoresById,
  totalStores,
  getSingleStoreBySlug,
  permittedToSellApparel,
  getAllStoreByType,
};
