const Enquiry = require('../models/Enquiry');

// @desc    Create enquiry
// @route   POST /api/enquiries
exports.createEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.create(req.body);
        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all enquiries (admin)
// @route   GET /api/enquiries
exports.getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete enquiry (admin)
// @route   DELETE /api/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        res.json({ message: 'Enquiry removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
