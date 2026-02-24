const express = require('express');
const router = express.Router();
const {
    addTeacher, getTeachers, getTeacher, updateTeacher, deleteTeacher,
    recordSalary, getSalaryOverview, getMyTeacher
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

// Teacher portal
router.get('/me', protect, getMyTeacher);

// Salary endpoints (admin)
router.post('/salary', protect, authorize('admin'), recordSalary);
router.get('/salary-overview', protect, authorize('admin'), getSalaryOverview);

// CRUD
router.route('/')
    .get(protect, authorize('admin'), getTeachers)
    .post(protect, authorize('admin'), addTeacher);

router.route('/:id')
    .get(protect, authorize('admin'), getTeacher)
    .put(protect, authorize('admin'), updateTeacher)
    .delete(protect, authorize('admin'), deleteTeacher);

module.exports = router;
