const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    admission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    stripeSessionId: {
        type: String
    },
    transactionId: {
        type: String
    },
    paymentMethod: {
        type: String,
        enum: ['Online', 'Manual', 'Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'],
        default: 'Online'
    },
    stripePaymentIntentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'pending_approval', 'paid', 'failed'],
        default: 'created'
    },
    receiptUrl: {
        type: String
    },
    installmentNumber: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
