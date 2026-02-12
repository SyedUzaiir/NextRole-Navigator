import mongoose from 'mongoose';

const EmployeeUploadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    course: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        required: false,
    },
    currentSkills: {
        type: mongoose.Schema.Types.Mixed, // String or Array
        required: false,
    },
    targetRole: {
        type: String,
        required: true,
    },
    yearsOfExperience: {
        type: Number,
        required: false,
    },
    upgradingSkills: {
        type: mongoose.Schema.Types.Mixed, // String or Array
        default: [],
    },
}, { timestamps: true });

export default mongoose.models.EmployeeUpload || mongoose.model('EmployeeUpload', EmployeeUploadSchema);
