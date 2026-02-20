const Admission = require('../models/Admission');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Salary = require('../models/Salary');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        const totalStudents = await Admission.countDocuments();
        const totalEnquiries = await Enquiry.countDocuments();
        const activeCourses = await Course.countDocuments({ status: 'Active' });
        const totalTeachers = await Teacher.countDocuments({ status: 'Active' });

        // Calculate total revenue (student payments)
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const grossRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate total salary paid
        const salaryResult = await Salary.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalSalaryPaid = salaryResult.length > 0 ? salaryResult[0].total : 0;

        // Net revenue = gross revenue - salary expenses
        const totalRevenue = grossRevenue - totalSalaryPaid;

        // Monthly revenue for chart
        const monthlyRevenue = await Payment.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        // Monthly salary expenses
        const monthlySalary = await Salary.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    expenses: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        // Admissions by course
        const admissionsByCourse = await Admission.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseApplied',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: '$course.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalStudents,
            totalEnquiries,
            totalRevenue,
            grossRevenue,
            totalSalaryPaid,
            totalTeachers,
            activeCourses,
            monthlyRevenue: monthlyRevenue.map(m => ({
                month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
                revenue: m.revenue,
                admissions: m.count
            })),
            monthlySalary: monthlySalary.map(m => ({
                month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
                expenses: m.expenses,
                count: m.count
            })),
            admissionsByCourse
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent admissions
// @route   GET /api/dashboard/recent
exports.getRecentAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find()
            .populate('courseApplied', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
