import mongoose from "mongoose";

const sharePropertiesSchema = new mongoose.Schema({

    //admin can share properties with other users
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


    sharedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
}, {
    timestamps: true
});

const ShareProperties = mongoose.model('ShareProperties', sharePropertiesSchema);
export default ShareProperties;
