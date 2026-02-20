const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    studentId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add name'],
        trim: true
    },
    fatherHusbandName: {
        type: String,
        required: [true, 'Please add father/husband name'],
        trim: true
    },
    motherName: {
        type: String,
        required: [true, 'Please add mother name'],
        trim: true
    },
    dob: {
        type: Date,
        required: [true, 'Please add date of birth']
    },
    gender: {
        type: String,
        required: [true, 'Please select gender'],
        enum: ['Male', 'Female', 'Other']
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed'],
        default: 'Single'
    },
    qualification: {
        type: String,
        default: ''
    },
    occupation: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        required: [true, 'Please add mobile number'],
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number']
    },
    email: {
        type: String,
        default: '',
        lowercase: true
    },
    address: {
        type: String,
        required: [true, 'Please add address']
    },
    aadharNumber: {
        type: String,
        default: ''
    },
    referenceBy: {
        type: String,
        default: ''
    },
    batchMonth: {
        type: String,
        default: ''
    },
    courseApplied: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Please select a course']
    },
    batchTiming: {
        type: String,
        required: [true, 'Please select batch timing'],
        enum: ['Morning (9AM-12PM)', 'Afternoon (12PM-3PM)', 'Evening (3PM-6PM)', 'Weekend']
    },
    passportPhoto: {
        type: String,
        default: ''
    },
    signature: {
        type: String,
        default: ''
    },
    discount: {
        type: Number,
        default: 0
    },
    finalFees: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Partially Paid', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentPlan: {
        type: String,
        enum: ['Full', 'Installment'],
        default: 'Full'
    },
    totalInstallments: {
        type: Number,
        default: 1
    },
    installments: [{
        number: Number,
        amount: Number,
        status: {
            type: String,
            enum: ['Pending', 'Paid'],
            default: 'Pending'
        },
        paidAt: Date,
        paymentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
    }],
    approved: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admission', admissionSchema);
