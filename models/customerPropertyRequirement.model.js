import mongoose from 'mongoose';


const customerPropertyRequirementSchema = new mongoose.Schema({
  
    propertyPurpose: {
        type: String,
        required: true,
        emum:['Residential','Commercial'],
    },
    propertyType: {
        type: String,
        required: true,
    },
    floor: {
        type: String,
        required: false,
    },
    furnished:{
        type: String,
        required: false,
    },
    format: {
        type: String,
        required: false,
    },
    state:{
        type: String,
        required:false,
    }
    ,city:{
        type: String,
        required:false,
    },
    area:{
        type: String,
        required: true,
    },
    pincode:{
        type: String,
        required: true,
    },
    size:{
        type: String,
        required: true,
    },
    priceRange:{
        type: String,
        required: true,
    },
    userDetails:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

});

export default mongoose.model('CustomerPropertyRequirement', customerPropertyRequirementSchema);
