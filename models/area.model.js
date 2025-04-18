import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  areaName: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: Number,
    required: true
  },
  // cityId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: '', // Assumes you have a Cit y model
  //   required: true
  // },
  isActive: { 
    type: Boolean,
    default: true
  }
}); 

const Area = mongoose.model('Area', areaSchema);

export default Area;
