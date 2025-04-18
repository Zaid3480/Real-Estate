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
        emum:['Flat','House','Bunglow','Shop','Office','Land','Showroom'],
    },
    floor: {
        type: String,
        required: false,
    },
    furnishedType:{
        type: String,
        required: false,
        emum:['Furnished','Semi-Furnished','Unfurnished'],
    },
    bhk: {
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
