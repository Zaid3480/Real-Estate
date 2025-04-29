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
  


export const getCustomerListOfShareProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const { search = '', page = 1, limit = 10, status } = req.query;

    if (!propertyId) {
      return sendResponse(res, 400, "Property ID is required.");
    }

    // Convert and validate pagination parameters
    const pageNumber = Math.max(1, parseInt(page)) || 1;
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit))) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Build base query
    const baseQuery = { propertyId };
    if (status && ['Interested', 'Not-Interested', 'Pending'].includes(status)) {
      baseQuery.status = status;
    }

    // Get shared properties with populated user data
    const shareProperties = await ShareProperties.find(baseQuery)
      .populate("sharedWith", "fullName email mobileNo")
      .lean(); // Using lean() for better performance

    // Apply search filter if provided
    const filteredProperties = search 
      ? shareProperties.filter(property => {
          if (!property.sharedWith) return false;
          const searchRegex = new RegExp(search, 'i');
          return (
            searchRegex.test(property.sharedWith.fullName) || 
            searchRegex.test(property.sharedWith.mobileNo)
          );
        })
      : shareProperties;

    // Handle empty results early
    if (filteredProperties.length === 0) {
      return sendResponse(res, 404, "No customers found with the given criteria.");
    }

    // Get customer requirements in a single query
    const customerIds = filteredProperties.map(p => p.sharedWith._id);
    const requirements = await CustomerRequirement.find({
      userDetails: { $in: customerIds }
    }).lean();

    // Create requirements lookup map
    const requirementsMap = requirements.reduce((map, req) => {
      const userId = req.userDetails.toString();
      map[userId] = map[userId] || [];
      map[userId].push(req);
      return map;
    }, {});

    // Combine data and apply pagination
    const combinedData = filteredProperties.map(property => ({
      ...property,
      customerRequirements: requirementsMap[property.sharedWith._id.toString()] || []
    }));

    // Paginate the combined results
    const paginatedResults = combinedData.slice(skip, skip + limitNumber);
    const total = combinedData.length;

    return sendResponse(res, 200, "Customers retrieved successfully.", {
      data: paginatedResults,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    });
  } catch (error) {
    console.error("Error retrieving customers:", error);
    return sendResponse(res, 500, "Internal server error", { 
      error: error.message 
    });
  }
};


export const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sharePropertyId = req.params.id;

    if (!status || !sharePropertyId) {
      return sendResponse(res, 400, "Status and Share Property ID are required.");
    }

    // Validate status
    if (!['Interested', 'Not-Interested', 'Pending'].includes(status)) {
      return sendResponse(res, 400, "Invalid status. Allowed values are: Interested, Not-Interested, Pending.");
    }

    // Update the status of the shared property
    const updatedShareProperty = await ShareProperties.findByIdAndUpdate(
      sharePropertyId,
      { status },
      { new: true }
    );

    if (!updatedShareProperty) {
      return sendResponse(res, 404, "Shared Property not found.");
    }

    return sendResponse(res, 200, "Status updated successfully.", updatedShareProperty);
  } catch (error) {
    console.error("Error updating status:", error);
    return sendResponse(res, 500, "Internal server error", { error: error.message });
  }
};  
