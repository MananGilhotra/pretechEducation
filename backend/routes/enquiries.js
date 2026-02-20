const express = require('express');
const router = express.Router();
const { createEnquiry, getEnquiries, deleteEnquiry } = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .post(createEnquiry)
    .get(protect, authorize('admin'), getEnquiries);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteEnquiry);

module.exports = router;
