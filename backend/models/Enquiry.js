const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add your full name'],
        trim: true
    },
    fatherHusbandName: {
        type: String,
        required: [true, 'Please add father/husband name'],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Please add mobile number'],
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number']
    },
    courseInterested: {
        type: String,
        required: [true, 'Please select a course']
    },
    preferredBatchTime: {
        type: String,
        required: [true, 'Please select preferred batch time'],
        enum: ['Morning (9AM-12PM)', 'Afternoon (12PM-3PM)', 'Evening (3PM-6PM)', 'Weekend']
    },
    message: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);
