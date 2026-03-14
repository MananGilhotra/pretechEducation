const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceSummary, markTeacherAttendance, getTeacherAttendance, getTeacherAttendanceSummary, getMyAttendance, getMyTeacherAttendance, getStudentAttendanceById } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Student/Teacher self-service (must be before admin-only middleware)
router.get('/me', protect, getMyAttendance);
router.get('/teachers/me', protect, getMyTeacherAttendance);

// Admin-only routes
router.use(protect, authorize('admin'));

// Student attendance
router.post('/mark', markAttendance);
router.get('/summary', getAttendanceSummary);
router.get('/student/:admissionId', getStudentAttendanceById);
router.get('/', getAttendance);

// Teacher attendance
router.post('/teachers/mark', markTeacherAttendance);
router.get('/teachers/summary', getTeacherAttendanceSummary);
router.get('/teachers', getTeacherAttendance);

module.exports = router;
