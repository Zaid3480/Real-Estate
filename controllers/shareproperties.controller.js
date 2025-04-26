import Property from "../models/property.model.js";
import ShareProperties from "../models/shareproperties.model.js";
import sendResponse from "../utils/ResponseHelper.js";

import CustomerRequirement from "../models/customerPropertyRequirement.model.js"; // import CustomerRequirement


export const sharePropertyToCustomer = async (req, res) => {
  try {
    const { userId, sharedWith, propertyId } = req.body;

    // Inline validation
    if (!userId || !sharedWith || !propertyId) {
      return sendResponse(res, 400, "brokerId, sharedWith, and propertyId are required.");
    }

    // Prevent duplicate sharing
    const existingShare = await ShareProperties.findOne({
      userId,
      sharedWith,
      propertyId,
    });

    if (existingShare) {
      return sendResponse(res, 409, "Property is already shared with this user.");
    }

    // Save the new shared property entry
    const sharedProperty = await ShareProperties.create({
      userId,
      sharedWith,
      propertyId,
    });

    return sendResponse(res, 201, "Property shared successfully.", sharedProperty);
  } catch (error) {
    console.error("Error sharing property:", error);
    return sendResponse(res, 500, "Internal server error", { error: error.message });
  }
};

export const getPropertiesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      floor,
      priceRange,
      category,
      type,
      format,
      furnished,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    if (!userId) {
      return sendResponse(res, 400, "User ID is required.");
    }

    // Build dynamic filter
    let propertyFilter = {};

    if (floor) propertyFilter.floor = floor;
    if (category) propertyFilter.category = category;
    if (type) propertyFilter.type = type;
    if (format) propertyFilter.format = format;
    if (furnished) propertyFilter.furnished = furnished;

    if (priceRange) {
      const price = Number(priceRange);
      if (!isNaN(price)) {
        propertyFilter.price = { $lte: price };
      }
    }

    if (search) {
      propertyFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

   
    const properties = await ShareProperties.find({ sharedWith: userId })
      .populate({
        path: "propertyId",
        match: propertyFilter,
      })
      .populate("sharedWith", "fullName email mobileNo")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    
    const filteredProperties = properties.filter(item => item.propertyId);

    const formattedProperties = filteredProperties.map(item => ({
      _id: item._id,
      sharedAt: item.createdAt,
      sharedWith: item.sharedWith,
      property: item.propertyId,
      propertyBroker: item.propertyId?.userId,
    }));


    const customerRequirement = await CustomerRequirement.findOne({ userDetails: userId });

    if (!customerRequirement && formattedProperties.length === 0) {
      return sendResponse(res, 404, "No properties or customer requirement found for this user.");
    }

    
    return sendResponse(res, 200, "Properties and customer requirement retrieved successfully.", {
      properties: formattedProperties,
      customerRequirement: customerRequirement || null, // send null if no customerRequirement found
    });

  } catch (error) {
    console.error("Error retrieving properties and customer requirement:", error);
    return sendResponse(res, 500, "Internal server error", { error: error.message });
  }
};

  



export const getPropertyById = async (req, res) => {
    try {
      const sharePropertyId = req.params.id;
  
      if (!sharePropertyId) {
        return sendResponse(res, 400, "Share Property ID is required.");
      }
  
      const sharedProperty = await ShareProperties.findById(sharePropertyId)
        .populate({
          path: "propertyId",
        //   populate: {
        //     path: "userId",
        //     select: "fullName email mobileNo role"
        //   }
        })
        .populate("sharedWith", "fullName email mobileNo")
        .exec();
  
      if (!sharedProperty) {
        return sendResponse(res, 404, "Shared Property not found.");
      }
  
      const formattedResponse = {
        _id: sharedProperty._id,
        sharedAt: sharedProperty.createdAt,
        sharedWith: sharedProperty.sharedWith,
        property: sharedProperty.propertyId,
        propertyBroker: sharedProperty.propertyId?.userId // fullName, email, mobileNo, role
      };
  
      return sendResponse(res, 200, "Shared Property retrieved successfully.", formattedResponse);
  
    } catch (error) {
      console.error("Error retrieving shared property:", error);
      return sendResponse(res, 500, "Internal server error", { error: error.message });
    }
};
  



