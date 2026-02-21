const express = require('express');
const router = express.Router();
const { createCheckout, verifyPayment, getPayments, getMyPayments, downloadReceipt, submitManualPayment, approvePayment, rejectPayment, recordPayment, getFeeSummary, updateInstallmentStatus, getFeeOverview, applyDiscount, updatePayment, deletePayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Deprecated: router.post('/create-checkout', protect, createCheckout);
// Deprecated: router.post('/verify', protect, verifyPayment);

router.post('/manual', protect, submitManualPayment);
router.put('/:id/approve', protect, authorize('admin'), approvePayment);
router.put('/:id/reject', protect, authorize('admin'), rejectPayment);

// Admin fee data-entry routes
router.post('/record', protect, authorize('admin'), recordPayment);
router.get('/overview', protect, authorize('admin'), getFeeOverview);
router.get('/summary/:admissionId', protect, authorize('admin'), getFeeSummary);
router.put('/installment/:admissionId/:installmentNumber', protect, authorize('admin'), updateInstallmentStatus);
router.put('/discount/:admissionId', protect, authorize('admin'), applyDiscount);

router.get('/', protect, authorize('admin'), getPayments);
router.get('/me', protect, getMyPayments);
router.get('/:id/receipt', downloadReceipt);
router.put('/:id', protect, authorize('admin'), updatePayment);
router.delete('/:id', protect, authorize('admin'), deletePayment);

module.exports = router;
