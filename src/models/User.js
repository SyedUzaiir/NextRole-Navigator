import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    currentRole: {
        type: String,
        required: true,
    },
    targetRole: {
        type: String,
        required: false,
    },
    // Courses are linked via the Course model (userId field)
    companyEmail: {
        type: String,
        required: true,
    },
    ranking: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    performanceRating: {
        type: Number,
        default: 0,
    },
    potentialRating: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Completed'],
        default: 'Ongoing',
    },
    score: {
        type: Number,
        default: 0,
    },
    // New Onboarding Fields
    department: {
        type: String,
        required: false, // Optional initially, required after onboarding
    },
    proficiencyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Expert'],
        required: false,
    },
    reportingManager: {
        type: String,
        required: false,
    },
    workExperience: {
        type: String, // Can be string or number, keeping flexible
        required: false,
    },
    experience: {
        adsScore: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 },
    },
    idpScore: {
        type: Number,
        default: 0,
    },
    softSkills: [{
        type: String,
    }],
    technicalSkills: [{
        type: String,
    }],
    certifications: [{
        type: String,
    }],
    isOnboardingComplete: {
        type: Boolean,
        default: false,
    },
    // References roleIds from demoData.js
    enrolledCourses: [{
        type: String,
    }],
    // References moduleIds from demoData.js
    completedModules: [{
        type: String,
    }],
    badges: [{
        id: String,
        name: String,
        dateEarned: Date,
        icon: String
    }],
    quizScores: [{
        roleId: String,
        score: Number,
        date: Date,
    }],
    recommendedCourses: [{
        title: String,
        description: String,
        category: String, // 'Mastering' or 'Transitioning'
        roleContext: String
    }],
    accountStatus: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING' // Defaulting to PENDING for existing users, but new ones might be Pending
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
