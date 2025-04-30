    import mongoose from 'mongoose';
    import User  from './user.model.js'; // Assuming you have a User model

    const supportSchema = new mongoose.Schema({
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,  // This ensures user is always set
        },
        message: {
        type: String,
        required: true,
        trim: true,
        },
        description:{
        type: String,
        default: null,
        },
        reply:{
        type: String,
        default: null,
        },
        photo:{
        type: String,
        default: null,
        },
        status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
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
    
    export const Support = mongoose.model('Support', supportSchema);

    export default Support;