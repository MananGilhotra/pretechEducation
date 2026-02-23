const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
exports.getCourses = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create course
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const courseData = { ...req.body };

        // Handle image upload (base64)
        if (req.file) {
            courseData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const course = await Course.create(courseData);
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle image upload (base64)
        if (req.file) {
            updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
