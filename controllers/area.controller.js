import mongoose from 'mongoose';
import Area from '../models/area.model.js'; // adjust path as needed


export const getAreaList = async (req, res) => {
    try {
      // Extract query parameters
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;
      const skip = (page - 1) * size;
      const { search } = req.query; // Only the search query parameter is considered
  
      // Initialize filter object
      const filter = {};
  
      // If search query is provided, add search functionality on areaName
      if (search) {
        filter.areaName = { $regex: search, $options: 'i' }; // Case-insensitive search
      }
  
      // Fetch data using filter (could be empty = all areas)
      const [areas, total] = await Promise.all([
        Area.find(filter)
          .sort({ areaName: 1 })  // Optional alphabetical sort
          .skip(skip)
          .limit(size),
        Area.countDocuments(filter)
      ]);
  
      // Respond with the result
      res.status(200).json({
        message: 'Area list fetched successfully',
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / size),
          totalRecords: total
        },
        areas
      });
  
    } catch (error) {
      console.error('Error fetching area list:', error);
      res.status(500).json({ message: 'Server error' });
    }
};
  





