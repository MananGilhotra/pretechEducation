const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .get(getCourses)
    .post(protect, authorize('admin'), upload.single('image'), createCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('admin'), upload.single('image'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
