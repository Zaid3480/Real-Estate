import mongoose from 'mongoose';


const propertySchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Swarnim Business Center"
  price: { type: Number, required: true }, // e.g., 25751
  area: { type: String, required: true }, // in sqft, e.g., 750
  floor: { type: String,required: false }, // e.g., "1st Floor"
  location: {
    type:String,required:false,
  },
  description: { type: String, required: false }, // e.g., "This is a beautiful property..."
  type: { type: String, enum: ['Residential', 'Commercial'], required: true },  
  category: { type: String, required: true },
  format: { type: String, required:false },
  sizeType: { type: String }, // e.g., "Sqft", "Sq. yard", etc.
  size: { type: String }, // e.g., "1000 sqft"
  furnished: { type: String, enum: ['Fully', 'Semi', 'Unfurnished'], default: 'Unfurnished' },

  status: { type: String, enum: [ 'Deal-Closed', 'Active'], default: 'Active' },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [{
    type: { type: String, enum: ['image', 'video'], required: false },
    path: { type: String, required: false }
  }],
}, { timestamps: true });


const Property = mongoose.model('Property', propertySchema);
export default Property;