import sendResponse from '../utils/ResponseHelper.js'; // Adjust path if needed
import CustomerPropertyRequirement from '../models/customerPropertyRequirement.model.js';


export const userPropertyRequirementForm = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return sendResponse(res, 401, 'Unauthorized: No user info in token');
        }

        // Create and save a new requirement entry
        const newRequirement = new CustomerPropertyRequirement({
            ...req.body,
            userDetails: userId,
        });

        const savedRequirement = await newRequirement.save();

        return sendResponse(res, 201, 'Property requirement submitted successfully.', savedRequirement);

    } catch (error) {
        console.error("Error in userPropertyRequirementForm:", error.message);
        return sendResponse(res, 500, error.message || 'Internal Server Error');
    }
};

export const requirementFormUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRequirement = await CustomerPropertyRequirement.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedRequirement) {
            return sendResponse(res, 404, 'Requirement not found');
        }

        return sendResponse(res, 200, 'Requirement updated successfully.', updatedRequirement);
    }
    catch (error) {
        console.error("Error in requirementFormUpdate:", error.message);
        return sendResponse(res, 500, error.message || 'Internal Server Error');
    }
}


export const getRequirementFormsForUser = async (req, res) => {
    //get userId from token
    const userId = req.user?._id;
    if (!userId) {
        return sendResponse(res, 401, 'Unauthorized: No user info in token');
    }

    try {
        const requirements = await CustomerPropertyRequirement.find({ userDetails: userId });
        return sendResponse(res, 200, 'Requirement forms fetched successfully.', requirements);
    } catch (error) {
        console.error("Error in getRequirementFormsForUser:", error.message);
        return sendResponse(res, 500, error.message || 'Internal Server Error');
    }

}













