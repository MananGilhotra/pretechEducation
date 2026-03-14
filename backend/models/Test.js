const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
}, { _id: false });

const questionSchema = new mongoose.Schema({
    questionText: { type: String, default: '' },
    questionImage: { type: String, default: '' }, // base64 data URI
    options: {
        type: [optionSchema],
        validate: [arr => arr.length >= 2 && arr.length <= 6, 'Each question must have 2-6 options']
    },
    marks: { type: Number, default: 1, min: 0 }
}, { _id: true });

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a test title'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Please select a course']
    },
    batches: {
        type: [String],
        required: [true, 'Please select at least one batch'],
        validate: [arr => arr.length > 0, 'At least one batch is required']
    },
    forTeachers: {
        type: Boolean,
        default: false
    },
    questions: {
        type: [questionSchema],
        default: []
    },
    duration: {
        type: Number,
        default: 0, // 0 = no time limit
        min: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Closed'],
        default: 'Draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Auto-calculate totalMarks before saving
testSchema.pre('save', function (next) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    next();
});

module.exports = mongoose.model('Test', testSchema);
