import mongoose from 'mongoose';

const RequirementSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: [true, 'Please provide a role name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    requirements: {
        type: [String],
        default: [],
    },
    skills: {
        type: [String],
        required: [true, 'Please provide at least one skill'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Requirement || mongoose.model('Requirement', RequirementSchema);
