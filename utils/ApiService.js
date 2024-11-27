import NotificationModel from "#models/notificationModel/notificationModel.js"

export const NotificationCreate = async (title, body, modelkey, model_id, activity_model, activityId) => {
    await NotificationModel.create({
      title,
      body,
      [modelkey]: model_id,
      [activity_model]: activityId,
      isRead: false,
    })
  
  }