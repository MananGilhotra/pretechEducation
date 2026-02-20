const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a course name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    duration: {
        type: String,
        required: [true, 'Please add duration']
    },
    fees: {
        type: Number,
        required: [true, 'Please add fees']
    },
    image: {
        type: String,
        default: ''
    },
    eligibility: {
        type: String,
        default: 'Open for all'
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Programming', 'Web Development', 'Data Science', 'Networking', 'Office Tools', 'Graphic Design', 'Certification', 'Other']
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
