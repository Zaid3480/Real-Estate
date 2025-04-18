import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    customerPropertyRequirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerPropertyRequirement',
        required: true
    },
    amountPaid:{
        type: Number,
        required: false
    },
    remaningAmount:{
        type: Number,
        required: false
    },
    refundAmount:{
        type: Number,
        required: false
    },
    isRefunded:{
        type: Boolean,
        default: false
    },
    earnAmount:{
        type: Number,
        default: 0
    }
});

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

export default UserSubscription;