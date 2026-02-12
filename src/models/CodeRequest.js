import mongoose from 'mongoose';

const CodeRequestSchema = new mongoose.Schema({
    employeeId: {
        type: String, // Or mongoose.Schema.Types.ObjectId if referencing a User model strictly
        required: true,
    },
    codeName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.CodeRequest || mongoose.model('CodeRequest', CodeRequestSchema);
