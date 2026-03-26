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
        required: [true, 'Please add a category']
    },
    batchSlots: {
        type: [String],
        default: [
            '8:00 AM - 9:00 AM',
            '9:00 AM - 10:00 AM',
            '10:00 AM - 11:00 AM',
            '11:00 AM - 12:00 PM',
            '12:00 PM - 1:00 PM',
            '5:00 PM - 6:00 PM',
            '6:00 PM - 7:00 PM',
            '7:00 PM - 8:00 PM',
            '8:00 PM - 9:00 PM'
        ]
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
