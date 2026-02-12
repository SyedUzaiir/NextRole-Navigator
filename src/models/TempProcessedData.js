import mongoose from 'mongoose';

const TempProcessedDataSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    processedData: {
        type: Array, // Array of objects
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Auto-delete after 24 hours
    },
});

export default mongoose.models.TempProcessedData || mongoose.model('TempProcessedData', TempProcessedDataSchema);
