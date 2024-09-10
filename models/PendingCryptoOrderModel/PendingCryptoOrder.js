import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const PendingCryptoOrderSchema = Schema(
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
    cart: {
      type: Array,
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    shippingFee: {
      type: Number,
      required: false,
      min: [0, 'Price Amounts must have a minimum value of 0'],
    },
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
      enum: ['processing', 'toBeDelivered', 'shipped', 'completed', 'canceled'],
    },
    paymentMethod: {
      type: String,
    },
    pickupType: {
      type: String,
      enum: ['express', 'standard', 'schedule'],
      // default: false,
    },
    pickUpDate: {
      type: Date,
    },
    pickupTime: {
      type: String,
    },
    seller: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Seller',
    },
  },
  {
    timestamps: true,
  },
);

export default model('pendingCryptoOrder', PendingCryptoOrderSchema);
