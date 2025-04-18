import UserSubscription from '../models/userSubscription.model.js';
import sendResponse from '../utils/ResponseHelper.js';

export const userSubscription = async (req, res) => {
    try {
        const subscriptionData = req.body;

        const newSubscription = new UserSubscription({ ...subscriptionData });
        const savedSubscription = await newSubscription.save();

        return sendResponse(res, 201, "User subscription created successfully", savedSubscription);
    } catch (error) {
        console.error("Error creating user subscription:", error);
        return sendResponse(res, 500, "Internal server error");
    }
};


export const updateUserSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const updateData = req.body;

    }catch (error) {
        console.error("Error updating user subscription:", error);
        return sendResponse(res, 500, "Internal server error");
    }
}


