import Property from "../models/property.model.js";
import CustomerPropertyRequirement from '../models/customerPropertyRequirement.model.js';
import User from '../models/user.model.js'; // Make sure you import your user model
import { sendResponse } from "../utils/ResponseHelper.js"; // Adjust the import path as necessary
import path from 'path'; // Import path for file handling
import multer from 'multer';




export const addProperty = async (req, res) => {
  try {
    const {
      title, price, area, floor, description,
      type, category, format, sizeType, furnished,
      location, size
    } = req.body;

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
      const userId = req.params.userId;  // Getting broker's userId from params
      const {
        floor,
        priceRange, // single value
        category,
        type,
        format,
        furnished,
        search // new field for title/location/area
      } = req.query;
  
      // Construct the query to filter properties by broker userId
      const query = { postedBy: userId };
  
      // Apply additional filters based on query parameters
      if (floor) query.floor = floor;
      if (category) query.category = category;
      if (format) query.format = format;
      if (furnished) query.furnished = furnished;
      if (type) query.type = type;
  
      if (priceRange) {
        query.price = { $lte: Number(priceRange) };  // Assuming price is less than or equal to priceRange
      }
  
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { area: { $regex: search, $options: "i" } }
        ];
      }
  
      // Find properties with the given filters and populate the 'postedBy' field
      const properties = await Property.find(query)
        .populate('postedBy', 'fullName mobileNo email');  // Populate 'postedBy' with user details
  
      // Check if any properties were found
      if (!properties || properties.length === 0) {
        return res.status(404).json({ message: "No properties found for this broker with given filters" });
      }
  
      // Return the properties
      res.status(200).json({ data: properties });
    } catch (error) {
      console.error("Get property by Broker ID error:", error);
      res.status(500).json({ error: error.message });
    }
  };
  

  export const updateProperty = async (req, res) => {
    try {
      const propertyId = req.params.id;
      const updates = req.body;
      const userId = req.user?._id;
  
      // Validate required inputs
      if (!propertyId || !userId) {
        return sendResponse(res, 400, 'Missing required fields: property ID or user ID');
      }
  
      // Verify property exists and user authorization
      const existingProperty = await Property.findById(propertyId);
      if (!existingProperty) {
        return sendResponse(res, 404, 'Property not found');
      }
      if (existingProperty.postedBy.toString() !== userId.toString()) {
        return sendResponse(res, 403, 'Unauthorized to update this property');
      }
  
      // Process uploaded files (images and videos)
      let allMedia = [];
      const allFiles = [
        ...(req.files['images'] || []),
        ...(req.files['videos'] || [])
      ];
  
      if (allFiles.length > 0) {
        allMedia = allFiles.map(file => ({
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          path: `/uploads/${file.filename}`
        }));
        updates.media = allMedia; // Update media array
      }
  
      // Validate update fields (optional, depending on your requirements)
      const allowedUpdates = [
        'title', 'price', 'area', 'floor', 'description',
        'type', 'category', 'format', 'sizeType', 'furnished',
        'location', 'size', 'media'
      ];
      const updateKeys = Object.keys(updates);
      const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
      if (!isValidUpdate) {
        return sendResponse(res, 400, 'Invalid update fields provided');
      }
  
      // Perform the update
      const updatedProperty = await Property.findByIdAndUpdate(
        propertyId,
        { ...updates, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
  
      if (!updatedProperty) {
        return sendResponse(res, 404, 'Property not found');
      }
  
      return sendResponse(res, 200, 'Property updated successfully', updatedProperty);
  
    } catch (error) {
      console.error('Update property error:', error);
      if (error instanceof mongoose.Error.ValidationError) {
        return sendResponse(res, 400, 'Validation error', { error: error.message });
      }
      return sendResponse(res, 500, 'Server error', { error: error.message });
    }
  };
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
  
  
  
  