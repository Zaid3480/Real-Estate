import Property from "../models/property.model.js";
import CustomerPropertyRequirement from '../models/customerPropertyRequirement.model.js';
import User from '../models/user.model.js'; // Make sure you import your user model
import { sendResponse } from "../utils/ResponseHelper.js"; // Adjust the import path as necessary

import multer from 'multer';
import ShareProperties from "../models/shareproperties.model.js";
import mongoose from "mongoose";






export const addProperty = async (req, res) => {
  try {
    const {
      title, price, area, floor, description,
      type, category, format, sizeType, furnished,
      location, size,pincode
    } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (!title || !price || !area || !type || !category || !req.user?._id) {
      return sendResponse(res, 400, 'Missing required fields');
    }

    // Process uploaded files (images and videos)
    let allMedia = [];

    const allFiles = [
      ...(req.files['images'] || []),
      ...(req.files['videos'] || [])
    ];

    allFiles.forEach(file => {
      const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      allMedia.push({
        type: mediaType,
        path: `/uploads/${file.filename}`
      });
    });

    // Create new Property
    const newProperty = new Property({
      title,
      price,
      area,
      floor,
      location,
      description,
      type,
      category,
      format,
      sizeType,
      size,
      furnished,
      postedBy: req.user._id,
      media: allMedia
    });

    // Save to database
    await newProperty.save();

    return sendResponse(res, 201, 'Property added successfully', newProperty);

  } catch (error) {
    console.error('Error adding property:', error);
    if (error instanceof multer.MulterError) {
      return sendResponse(res, 400, `Multer error: ${error.message}`);
    }
    return sendResponse(res, 500, 'Server error', { error: error.message });
  }
};



export const getPropertyById = async (req, res) => {
    try {
      const propertyId = req.params.id;
      const property = await Property.findById(propertyId).populate('postedBy', 'fullName mobileNo email'); // Populate user details if needed
  
      if (!property) {
        return sendResponse(res, 404, "Property not found");
      }
  
      return sendResponse(res, 200, "Property details fetched successfully", property);
  
    } catch (error) {
      console.error("Get property by ID error:", error);
      return sendResponse(res, 500, "Server error", { error: error.message });
    }
  };

export const getPropertyByBrokerId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const {
      floor,
      priceRange,
      category,
      type,
      format,
      furnished,
      search
    } = req.query;

    const query = { postedBy: userId };

    if (floor) query.floor = floor;
    if (category) query.category = category;
    if (format) query.format = format;
    if (furnished) query.furnished = furnished;
    if (type) query.type = type;

    if (priceRange) {
      query.price = { $lte: Number(priceRange) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } }
      ];
    }

    const properties = await Property.find(query)
      .populate('postedBy', 'fullName mobileNo email');

    if (!properties || properties.length === 0) {
      return sendResponse(res, 404, "No properties found for this broker with given filters");
    }

    return sendResponse(res, 200, "Properties fetched successfully", properties);
  } catch (error) {
    console.error("Get property by Broker ID error:", error);
    return sendResponse(res, 500, "Server error", { error: error.message });
  }
};



export const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id
    const userId = req.user?._id

    // Validate required inputs
    if (!propertyId || !userId) {
      return sendResponse(res, 400, "Missing required fields: property ID or user ID")
    }

    // Fetch the existing property
    const existingProperty = await Property.findById(propertyId)
    if (!existingProperty) {
      return sendResponse(res, 404, "Property not found")
    }

    // Extract updates from request body
    const updates = { ...req.body }

    // Handle media updates
    let updatedMedia = [...(existingProperty.media || [])]

    // Process new media files
    if (req.files) {
      console.log("Received files:", req.files)

      // Process images
      const newImages = (req.files["images"] || []).map((file) => ({
        type: "image",
        path: `/uploads/${file.filename}`,
      }))

      // Process videos
      const newVideos = (req.files["videos"] || []).map((file) => ({
        type: "video",
        path: `/uploads/${file.filename}`,
      }))

      // Combine all new media
      const newMedia = [...newImages, ...newVideos]
      console.log("New media to add:", newMedia)

      // Add new media to existing media
      updatedMedia = [...updatedMedia, ...newMedia]
    }

    // Handle media removal
    if (req.body.removeMedia) {
      const removeMediaPaths = Array.isArray(req.body.removeMedia) ? req.body.removeMedia : [req.body.removeMedia]

      console.log("Media paths to remove:", removeMediaPaths)

      // Filter out media that should be removed
      updatedMedia = updatedMedia.filter((media) => !removeMediaPaths.includes(media.path))

    }

    // Update the media array in the updates object
    updates.media = updatedMedia

    // Remove removeMedia from updates as it's not a property field
    delete updates.removeMedia

    // Clean up any empty fields or fields that shouldn't be in the database
    Object.keys(updates).forEach((key) => {
      if (updates[key] === "" || updates[key] === undefined || updates[key] === null) {
        delete updates[key]
      }
    })

    console.log("Final updates to apply:", updates)

    // Perform the update
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!updatedProperty) {
      return sendResponse(res, 404, "Property not found after update")
    }

    return sendResponse(res, 200, "Property updated successfully", updatedProperty)
  } catch (error) {
    console.error("Update property error:", error)
    if (error.name === "ValidationError") {
      return sendResponse(res, 400, "Validation error", { error: error.message })
    }
    return sendResponse(res, 500, "Server error", { error: error.message })
  }
}

  
  export const changeStatusOfProperty = async (req, res) => {
    try {
      const propertyId = req.params.id;
      const { status } = req.body;
  
      const updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        { status },
        { new: true }
      );
  
      if (!updatedProperty) {
        return sendResponse(res, 404, "Property not found");
      }
  
      return sendResponse(res, 200, "Property status updated successfully", updatedProperty);
  
    } catch (error) {
      console.error("Change property status error:", error);
      return sendResponse(res, 500, "Server error", { error: error.message });
    }
  };
export const getAllProperties = async (req, res) => {
    try {
      const {
        floor,
        priceRange,
        category,
        type,
        format,
        furnished,
        search,
        page = 1,
        limit = 10
      } = req.query;
  
      const query = {};
  
      if (floor) query.floor = floor;
      if (category) query.category = category;
      if (format) query.format = format;
      if (furnished) query.furnished = furnished;
      if (type) query.type = type;
  
      if (priceRange) {
        query.price = { $lte: Number(priceRange) };
      }
  
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { "location.address": { $regex: search, $options: "i" } },
          { area: { $regex: search, $options: "i" } }
        ];
      }
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const totalCount = await Property.countDocuments(query);
  
      const properties = await Property.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'fullName mobileNo email');
  
      if (!properties || properties.length === 0) {
        return sendResponse(res, 404, "No properties found with given filters");
      }
  
      return sendResponse(res, 200, "Properties fetched successfully", {
        data: properties,
        pagination: {
          total: totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit)
        }
      });
  
    } catch (error) {
      console.error("Get all properties error:", error);
      return sendResponse(res, 500, "Server error", { error: error.message });
    }
  };


export const getPropertyListByUserRequirement = async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;
  
      console.log("User ID:", userId);
  
      // 1. Fetch user
      const user = await User.findById(userId, 'fullName mobileNo email');
      if (!user) {
        return sendResponse(res, 404, 'User not found');
      }
  
      // 2. Fetch requirement
      const requirement = await CustomerPropertyRequirement.findOne({ userDetails: userId });
  
      console.log("User requirement:", requirement);
  
      if (!requirement) {
        return sendResponse(res, 404, 'No property requirement found for this user');
      }
  
      // 3. Build OR filter conditions
      const orConditions = [];
  
      if (requirement.propertyType) orConditions.push({ type: requirement.propertyType });
      if (requirement.floor) orConditions.push({ floor: requirement.floor });
      if (requirement.furnished) orConditions.push({ furnished: requirement.furnished });
      if (requirement.format) orConditions.push({ format: requirement.format });
      if (requirement.area) orConditions.push({ area: { $regex: requirement.area, $options: 'i' } });
      if (requirement.size) orConditions.push({ size: requirement.size });
      if (requirement.state) orConditions.push({ 'location.state': requirement.state });
      if (requirement.city) orConditions.push({ 'location.city': requirement.city });
  
      if (requirement.priceRange) {
        const price = parseInt(requirement.priceRange, 10);
        if (!isNaN(price)) {
          orConditions.push({ price: { $lte: price } });
        }
      }
  
      // 4. Search query
      const searchQuery = search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { area: { $regex: search, $options: 'i' } },
              { 'location.address': { $regex: search, $options: 'i' } },
            ],
          }
        : {};
  
      // 5. Combine final query
      let finalQuery = {};
      if (searchQuery.$or && searchQuery.$or.length > 0) {
        finalQuery = {
          $and: [
            { $or: orConditions },
            searchQuery,
          ],
        };
      } else {
        finalQuery = { $or: orConditions };
      }
  
      // 6. Fetch matching properties
      const properties = await Property.find(finalQuery)
        .skip(Number(skip))
        .limit(Number(limit));
  
      const total = await Property.countDocuments(finalQuery);
  
      // 7. Send response
      return sendResponse(res, 200, 'Properties fetched based on user requirement', {
        user: {
          fullName: user.fullName,
          mobileNo: user.mobileNo,
          email: user.email,
        },
        properties,
        requirement,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
        },
      });
  
    } catch (error) {
      console.error('Error fetching properties:', error);
      return sendResponse(res, 500, 'Server error', { error: error.message });
    }
};


export const suggestedPropertiesToCustomerCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Validate ObjectId first
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendResponse(res, 400, 'Invalid user ID');
    }

    // ✅ Search entire ShareProperties collection where sharedWith == userId
    const count = await ShareProperties.countDocuments({ sharedWith: userId });

    return sendResponse(res, 200, 'Count fetched successfully', { totalSharedWithCount: count });
  } catch (error) {
    console.error('Error fetching count:', error);
    return sendResponse(res, 500, 'Server error', { error: error.message });
  }
};

export const getBrokerDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;
    const brokerId = userId; // Broker's ID

    // 1. Fetch broker details
    const user = await User.findById(brokerId, 'fullName mobileNo email');
    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }

    // 2. Fetch all properties listed by this broker
    const allProperties = await Property.find({ postedBy: brokerId });

    // 3. Count by status
    const totalProperties = allProperties.length;
    const activeCount = allProperties.filter(p => p.status === 'Active').length;
    const closedCount = allProperties.filter(p => p.status === 'Deal-Closed').length;

    // 4. Construct dashboard response
    const dashboardData = {
      broker: user,
      totalProperties,
      activeProperties: activeCount,
      closedDeals: closedCount
    };

    return sendResponse(res, 200, 'Broker dashboard data fetched successfully', dashboardData);

  } catch (error) {
    console.error('Error fetching broker dashboard data:', error);
    return sendResponse(res, 500, 'Server error', { error: error.message });
  }
};




  
  