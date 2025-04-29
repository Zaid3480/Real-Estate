import mongoose from 'mongoose';


const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // Assuming you have a User model
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('TicketSupport', TicketSchema);


