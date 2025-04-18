import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    
    fullName: {
        type: String,
        required: true,
    },
    mobileNo:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    address:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['admin', 'user','broker'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },
    isForgotPassword: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpire: {
        type: Date,
        default: null,
    },
        isActive: {
            type: Boolean,
            default: true,
        }
        ,
        isSubscribedForCommercial:{
                type: Boolean,
                default: false,
            },
            isSubscribedForResidential:{
                type: Boolean,
                default: false,
            },
    });

const User = mongoose.model('User', userSchema);

export default User;