import customerModel from "#models/userModels/customerModel/customerModel.js";
import { firebase } from "../../config/Firebase.config.js";

async function sendNotification(
    token,
    title,
    body,
) {
    try {
        if (token) {
            const message = {
                data: {
                    title,
                    body,
                },
                token,
            };
            const response = await firebase.messaging().send(message);
            console.log(response, "Customer NOIFICATION.");
            return response;
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

export const notificationHelper = async (_id, modelName, FCM, title, body, date, time) => {
    // const Model = await import(`../models/${modelName}.js`);
    // const model = Model.default || Model;
    const isTokenFind = await customerModel.findById({ _id: _id });
    if (isTokenFind[FCM]) {
        await sendNotification(
            isTokenFind?.fcmtoken,
            title,
            body,notificationHelper,
            date,
            time
        );
    } else {
        console.log("FCM token not found ");
    }
};
