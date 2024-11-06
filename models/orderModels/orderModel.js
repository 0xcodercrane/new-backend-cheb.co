import { Type } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const orderSchema = Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    store: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SellerStore',
    },
    address: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'Address',
    },

    //     state: {
    //         // type: Schema.Types.ObjectId,
    //         required: true,
    //         ref: 'State'
    //     },
    //     city: {
    //         // type: Schema.Types.ObjectId,
    //         required: true,
    //         ref: 'City'
    //     },
    //    street: {
    //         // type: Schema.Types.ObjectId,
    //         required: true,
    //         ref: 'Street'
    //     },

    // purchasePrice: {
    //   type: Number,
    //   required: true,
    //   min: [0, "Price Amounts must have a minimum value of 0"],
    // },
    // processingFee: {
    //   type: Number,
    //   required: true,
    //   min: [0, "Price Amounts must have a minimum value of 0"],
    // },
    shippingFee: {
      type: Number,
      required: false,
      min: [0, 'Price Amounts must have a minimum value of 0'],
    },
    shipmentId :{
      Type:String      
    },
    trackingId :{
      Type:String      
    },

    trackingUrl :{
      Type:String      
    },

    trackingCode:{
      type: String
    },

    tracking_details :{
      type: Array,
      required: false
    },  

    // authenticationFee: {
    //   type: Number,
    //   required: true,
    //   min: [0, "Price Amounts must have a minimum value of 0"],
    // },
    // discount: {
    //   type: Number,
    //   // required: true,
    //   min: [0, "Price Amounts must have a minimum value of 0"],
    // },

    tax: {
      type: Number,
      required: true,
      min: [0, 'Price Amounts must have a minimum value of 0'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Price Amounts must have a minimum value of 0'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Price Amounts must have a minimum value of 0'],
    },

    orderStatus: {
      type: String,
      required: true,
      enum: ['processing', 'toBeDelivered', 'shipped', 'completed', 'canceled' , "delivered", "pre_transit"],
    },
    paymentMethod: {
      type: String,
    },
    pickupType: {
      type: String,
      enum: ['express', 'standard', 'schedule'],
    },
    pickUpDate: {
      type: Date,
    },
    pickupTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default model('Order', orderSchema);
