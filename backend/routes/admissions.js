const express = require('express');
const router = express.Router();
const { createAdmission, createAdmissionAdmin, getAdmissions, getMyAdmission, approveAdmission, exportAdmissions, deleteAdmission, updateAdmission } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .post(upload.fields([
        { name: 'passportPhoto', maxCount: 1 },
        { name: 'signature', maxCount: 1 }
    ]), createAdmission)
    .get(protect, authorize('admin'), getAdmissions);

router.post('/admin', protect, authorize('admin'), upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), createAdmissionAdmin);

router.get('/me', protect, getMyAdmission);
router.get('/export', protect, authorize('admin'), exportAdmissions);
router.put('/:id/approve', protect, authorize('admin'), approveAdmission);
router.delete('/:id', protect, authorize('admin'), deleteAdmission);

router.put('/:id', protect, authorize('admin'), upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), updateAdmission);

module.exports = router;
