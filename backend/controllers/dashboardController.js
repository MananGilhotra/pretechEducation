const Admission = require('../models/Admission');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Salary = require('../models/Salary');
const Expense = require('../models/Expense');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        // Run ALL independent queries in parallel instead of sequentially
        const [
            totalStudents,
            totalEnquiries,
            activeCourses,
            totalTeachers,
            revenueResult,
            salaryResult,
            expenseResult,
            monthlyRevenue,
            monthlySalary,
            admissionsByCourse
        ] = await Promise.all([
            Admission.countDocuments(),
            Enquiry.countDocuments(),
            Course.countDocuments({ status: 'Active' }),
            Teacher.countDocuments({ status: 'Active' }),

            // Total revenue
            Payment.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // Total salary paid
            Salary.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // Total expenses
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // Monthly revenue for chart
            Payment.aggregate([
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
            ]),

            // Monthly salary expenses
            Salary.aggregate([
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
            ]),

            // Admissions by course
            Admission.aggregate([
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
            ])
        ]);

        const grossRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        const totalSalaryPaid = salaryResult.length > 0 ? salaryResult[0].total : 0;
        const totalExpenses = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const totalRevenue = grossRevenue - totalSalaryPaid - totalExpenses;

        res.json({
            totalStudents,
            totalEnquiries,
            totalRevenue,
            grossRevenue,
            totalSalaryPaid,
            totalExpenses,
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
            .select('studentId name paymentStatus courseApplied createdAt')
            .populate('courseApplied', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

