const express = require('express');
const router = express.Router();
const { getStats, getRecentAdmissions } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/recent', protect, authorize('admin'), getRecentAdmissions);

module.exports = router;
