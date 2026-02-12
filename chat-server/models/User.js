const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    socketId: String // To track current connection if needed
});

module.exports = mongoose.model('User', UserSchema);
