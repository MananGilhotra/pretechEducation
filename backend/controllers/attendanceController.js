const Attendance = require('../models/Attendance');
const Admission = require('../models/Admission');

// @desc    Bulk mark attendance for a course on a date
// @route   POST /api/attendance/mark
// @access  Admin
exports.markAttendance = async (req, res) => {
    try {
        const { courseId, date, records } = req.body;

        if (!courseId || !date || !records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'courseId, date, and records[] are required' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const bulkOps = records.map(r => ({
            updateOne: {
                filter: { student: r.studentId, course: courseId, date: attendanceDate },
                update: {
                    $set: {
                        status: r.status,
                        markedBy: req.user._id
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(bulkOps);

        res.json({ message: `Attendance marked for ${records.length} students` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance records (filterable by course, date, date range)
// @route   GET /api/attendance
// @access  Admin
exports.getAttendance = async (req, res) => {
    try {
        const { course, date, from, to } = req.query;
        const filter = {};

        if (course) filter.course = course;

        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            filter.date = { $gte: d, $lt: next };
        } else if (from || to) {
            filter.date = {};
            if (from) {
                const f = new Date(from);
                f.setHours(0, 0, 0, 0);
                filter.date.$gte = f;
            }
            if (to) {
                const t = new Date(to);
                t.setHours(23, 59, 59, 999);
                filter.date.$lte = t;
            }
        }

        const records = await Attendance.find(filter)
            .populate('student', 'name studentId')
            .populate('course', 'name')
            .sort({ date: -1, 'student.name': 1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance summary per student for a course in a date range
// @route   GET /api/attendance/summary
// @access  Admin
exports.getAttendanceSummary = async (req, res) => {
    try {
        const { course, from, to } = req.query;
        if (!course) {
            return res.status(400).json({ message: 'course query param is required' });
        }

        const mongoose = require('mongoose');
        const matchStage = { course: new mongoose.Types.ObjectId(course) };

        if (from || to) {
            matchStage.date = {};
            if (from) {
                const f = new Date(from);
                f.setHours(0, 0, 0, 0);
                matchStage.date.$gte = f;
            }
            if (to) {
                const t = new Date(to);
                t.setHours(23, 59, 59, 999);
                matchStage.date.$lte = t;
            }
        }

        const summary = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$student',
                    totalDays: { $sum: 1 },
                    presentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
                    },
                    absentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'admissions',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$studentInfo.name',
                    studentId: '$studentInfo.studentId',
                    totalDays: 1,
                    presentDays: 1,
                    absentDays: 1,
                    percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] },
                            1
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ]);

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ======================== TEACHER ATTENDANCE ========================

const TeacherAttendance = require('../models/TeacherAttendance');

// @desc    Bulk mark teacher attendance for a date
// @route   POST /api/attendance/teachers/mark
// @access  Admin
exports.markTeacherAttendance = async (req, res) => {
    try {
        const { date, records } = req.body;

        if (!date || !records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'date and records[] are required' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const bulkOps = records.map(r => ({
            updateOne: {
                filter: { teacher: r.teacherId, date: attendanceDate },
                update: {
                    $set: {
                        status: r.status,
                        markedBy: req.user._id
                    }
                },
                upsert: true
            }
        }));

        await TeacherAttendance.bulkWrite(bulkOps);

        res.json({ message: `Attendance marked for ${records.length} teachers` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher attendance records
// @route   GET /api/attendance/teachers
// @access  Admin
exports.getTeacherAttendance = async (req, res) => {
    try {
        const { date, from, to } = req.query;
        const filter = {};

        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            filter.date = { $gte: d, $lt: next };
        } else if (from || to) {
            filter.date = {};
            if (from) {
                const f = new Date(from);
                f.setHours(0, 0, 0, 0);
                filter.date.$gte = f;
            }
            if (to) {
                const t = new Date(to);
                t.setHours(23, 59, 59, 999);
                filter.date.$lte = t;
            }
        }

        const records = await TeacherAttendance.find(filter)
            .populate('teacher', 'name subject phone')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher attendance summary
// @route   GET /api/attendance/teachers/summary
// @access  Admin
exports.getTeacherAttendanceSummary = async (req, res) => {
    try {
        const { from, to } = req.query;
        const matchStage = {};

        if (from || to) {
            matchStage.date = {};
            if (from) {
                const f = new Date(from);
                f.setHours(0, 0, 0, 0);
                matchStage.date.$gte = f;
            }
            if (to) {
                const t = new Date(to);
                t.setHours(23, 59, 59, 999);
                matchStage.date.$lte = t;
            }
        }

        const pipeline = [
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            {
                $group: {
                    _id: '$teacher',
                    totalDays: { $sum: 1 },
                    presentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
                    },
                    absentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'teacherInfo'
                }
            },
            { $unwind: '$teacherInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$teacherInfo.name',
                    subject: '$teacherInfo.subject',
                    totalDays: 1,
                    presentDays: 1,
                    absentDays: 1,
                    percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$presentDays', '$totalDays'] }, 100] },
                            1
                        ]
                    }
                }
            },
            { $sort: { name: 1 } }
        ];

        const summary = await TeacherAttendance.aggregate(pipeline);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

