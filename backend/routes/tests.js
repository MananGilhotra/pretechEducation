const express = require('express');
const router = express.Router();
const {
    createTest, getTests, getTestById, updateTest, deleteTest,
    getTestSubmissions, resetSubmission, resetAllSubmissions, bulkImportQuestions,
    getMyTests, getTestForAttempt, submitTest, getMySubmission
} = require('../controllers/testController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Student/Teacher self-service (before admin middleware)
router.get('/me', protect, getMyTests);
router.get('/:id/attempt', protect, getTestForAttempt);
router.post('/:id/submit', protect, submitTest);
router.get('/:id/my-result', protect, getMySubmission);

// Admin-only routes
router.post('/', protect, authorize('admin'), createTest);
router.get('/', protect, authorize('admin'), getTests);
router.get('/:id/submissions', protect, authorize('admin'), getTestSubmissions);
router.delete('/:id/submissions', protect, authorize('admin'), resetAllSubmissions);
router.delete('/:id/submissions/:submissionId', protect, authorize('admin'), resetSubmission);
router.post('/:id/import', protect, authorize('admin'), bulkImportQuestions);
router.get('/:id', protect, authorize('admin'), getTestById);
router.put('/:id', protect, authorize('admin'), updateTest);
router.delete('/:id', protect, authorize('admin'), deleteTest);

module.exports = router;
