import admin from "../config/firebase-config.js";





export const sendPushNotification = async (tokens, title, body, data) => {
    const message = {
        tokens, // Array of FCM tokens
        notification: {
            title,
            body,
        },
        data: typeof data === "object" && data !== null ? data : {}, // Ensure data is an object
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(" Push notification response:", JSON.stringify(response, null, 2));

        // Log failed notifications
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(` Error sending to token ${tokens[idx]}:`, resp.error);
                }
            });
        }

        return { success: true, response };
    } catch (error) {
        console.error(" Error sending push notification:", error);
        return { success: false, error };
    }
};
