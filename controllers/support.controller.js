
import Support from '../models/support.model.js';
import sendResponse from '../utils/ResponseHelper.js'; // Adjust path if needed


export const supportCustomer = async (req, res) => {
    try {
      const userId = req.user._id;
      const { message } = req.body;
      const {description} = req.body; // Extract description and reply from request body
  
      // Access the uploaded file (photo) if it exists
      const photo = req.file ? req.file.path : null;
  
      const support = new Support({
        userId,
        message,
        description, // Store the description in the support request
        photo, // Store the photo file path
      });
  
      await support.save();
  
      return sendResponse(res, 201, 'Support request submitted successfully', support);
    } catch (error) {
      console.error('Error in supportCustomer:', error);
      return sendResponse(res, 500, 'Internal Server Error', error.message);
    }
  };

export const getSupportById = async (req, res) => {
    try {
      const supportId = req.params.id;
  
      const support = await Support.findById(supportId)
        .populate('userId', 'fullName email mobileNo') // populate userId with selected fields
        .exec();
  
      if (!support) {
        return sendResponse(res, 404, 'Support message not found');
      }
  
      // Optionally, rename `userId` to `user` in the response for clarity
      const supportWithUser = {
        ...support.toObject(),
        user: support.userId,
      };
      delete supportWithUser.userId; // remove original field if needed
  
      return sendResponse(res, 200, 'Support message retrieved successfully', supportWithUser);
    } catch (error) {
      console.error('Error retrieving support message:', error);
      return sendResponse(res, 500, 'Internal Server Error', error.message);
}};

export const getSupportByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const supportMessages = await Support.find({ userId })
        .populate('userId', 'fullName email mobileNo') // populate userId with selected fields
        .exec();
  
      if (!supportMessages || supportMessages.length === 0) {
        return sendResponse(res, 404, 'No support messages found for this user');
      }
  
      return sendResponse(res, 200, 'Support messages retrieved successfully', supportMessages);
    } catch (error) {
      console.error('Error retrieving support messages:', error);
      return sendResponse(res, 500, 'Internal Server Error', error.message);
    }
};

export const getAllSupportRequestFromUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const supportMessages = await Support.find({ userId })
        .populate('userId', 'fullName email mobileNo') // populate userId with selected fields
        .exec();
  
      if (!supportMessages || supportMessages.length === 0) {
        return sendResponse(res, 404, 'No support messages found for this user');
      }
  
      return sendResponse(res, 200, 'Support messages retrieved successfully', supportMessages);
    } catch (error) {
      console.error('Error retrieving support messages:', error);
      return sendResponse(res, 500, 'Internal Server Error', error.message);
    }
};

