const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add name'],
        trim: true
    },
    email: {
        type: String,
        default: '',
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please add phone number'],
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
    },
    subject: {
        type: String,
        required: [true, 'Please add subject/specialization']
    },
    qualification: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    aadharNumber: {
        type: String,
        default: ''
    },
    monthlySalary: {
        type: Number,
        required: [true, 'Please add monthly salary'],
        min: 0
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'On Leave'],
        default: 'Active'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
