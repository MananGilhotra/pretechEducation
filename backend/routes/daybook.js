const express = require('express');
const router = express.Router();
const { getDayBook } = require('../controllers/daybookController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getDayBook);

module.exports = router;
