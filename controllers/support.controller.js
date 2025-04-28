
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

export const replyToCustomer = async (req, res) => {
    try {
      const supportId = req.params.id;
      const { reply } = req.body;
  
      const support = await Support.findById(supportId);
  
      if (!support) {
        return sendResponse(res, 404, 'Support message not found');
      }
  
      // Update the support message with the reply
      support.reply = reply; // Assuming you have a field for storing replies
      await support.save();
  
      return sendResponse(res, 200, 'Reply sent successfully', support);
    } catch (error) {
      console.error('Error replying to customer:', error);
      return sendResponse(res, 500, 'Internal Server Error', error.message);
    }
}

export const getAllSupportRequest = async (req, res) => {
    try {
      const pageNum = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limitNum = Math.max(parseInt(req.query.limit, 10) || 10, 1);
      const search = req.query.search || "";
  
      const matchStage = {};
  
      const aggregationPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $match: {
            "user.fullName": { $regex: search, $options: "i" },
            ...matchStage
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: (pageNum - 1) * limitNum
        },
        {
          $limit: limitNum
        },
        {
          $addFields: {
            user: {
              _id: "$user._id",
              fullName: "$user.fullName",
              email: "$user.email",
              mobileNo: "$user.mobileNo"
            }
          }
        }
      ];
  
      const [messages, totalResult] = await Promise.all([
        Support.aggregate(aggregationPipeline),
        Support.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: "$user"
          },
          {
            $match: {
              "user.fullName": { $regex: search, $options: "i" },
              ...matchStage
            }
          },
          { $count: "total" }
        ])
      ]);
  
      const total = totalResult[0]?.total || 0;
  
      if (!messages.length) {
        return sendResponse(res, 404, "No support messages found");
      }
  
      const totalPages = Math.ceil(total / limitNum);
  
      return sendResponse(res, 200, "Support messages retrieved successfully", {
        messages,
        paging: {
          total,
          totalPages,
          page: pageNum,
          limit: limitNum
        }
      });
    } catch (error) {
      console.error("Error retrieving support messages:", error);
      return sendResponse(res, 500, "Internal Server Error", error.message);
    }
};
  
  
  
