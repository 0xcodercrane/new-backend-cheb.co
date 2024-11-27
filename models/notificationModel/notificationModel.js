import mongoose from "mongoose";

const notificationschema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: false,
      },
      body : {
        type: String,
        required: false,
      },
      isRead: {
        type: Boolean,
        required: false,
        default: false,
      },
      customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: false,
      },
      orderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: false,
      },
      isDeleted: {
        type: Boolean,
        required: false,
        default: false,
      },
     
    },
    {
      timestamps: true,
    }
);

const NotificationModel = mongoose.model("Notification", notificationschema);

export default NotificationModel;
