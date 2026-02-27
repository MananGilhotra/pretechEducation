const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceSummary, markTeacherAttendance, getTeacherAttendance, getTeacherAttendanceSummary } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// Student attendance
router.post('/mark', markAttendance);
router.get('/summary', getAttendanceSummary);
router.get('/', getAttendance);

// Teacher attendance
router.post('/teachers/mark', markTeacherAttendance);
router.get('/teachers/summary', getTeacherAttendanceSummary);
router.get('/teachers', getTeacherAttendance);

module.exports = router;
