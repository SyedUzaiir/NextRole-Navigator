const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: String, // Treating IDs as strings for now (could be ObjectId if normalized)
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
