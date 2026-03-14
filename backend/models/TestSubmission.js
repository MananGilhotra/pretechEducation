const mongoose = require('mongoose');

const testSubmissionSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    submitterType: {
        type: String,
        enum: ['student', 'teacher'],
        required: true
    },
    submitterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // References Admission (student) or Teacher (teacher)
    },
    answers: [{
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, default: -1 } // -1 = not answered
    }],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// One submission per person per test
testSubmissionSchema.index({ test: 1, submitterType: 1, submitterId: 1 }, { unique: true });

module.exports = mongoose.model('TestSubmission', testSubmissionSchema);
