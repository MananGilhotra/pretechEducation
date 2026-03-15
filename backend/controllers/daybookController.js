const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Salary = require('../models/Salary');
const Admission = require('../models/Admission');
const Teacher = require('../models/Teacher');

// @desc    Get day book entries for a date range
// @route   GET /api/daybook?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Admin
exports.getDayBook = async (req, res) => {
    try {
        const { from, to } = req.query;

        // Default to today
        const startDate = from ? new Date(from) : new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = to ? new Date(to) : new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        // 1. Received — Fee Payments (status = 'paid')
        const payments = await Payment.find({
            status: 'paid',
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate({
            path: 'admission',
            select: 'name studentId courseApplied',
            populate: { path: 'courseApplied', select: 'name' }
        }).sort({ createdAt: 1 });

        const received = payments.map(p => ({
            _id: p._id,
            type: 'received',
            category: 'Fee Payment',
            description: `${p.admission?.name || 'Student'} — ${p.admission?.courseApplied?.name || 'Course'}`,
            studentId: p.admission?.studentId || '',
            amount: p.amount,
            method: p.paymentMethod,
            date: p.createdAt,
            transactionId: p.transactionId || ''
        }));

        // 2. Outgoing — Expenses
        const expenses = await Expense.find({
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        const outgoingExpenses = expenses.map(e => ({
            _id: e._id,
            type: 'outgoing',
            category: e.category,
            description: e.title,
            amount: e.amount,
            method: '',
            date: e.date,
            notes: e.notes || ''
        }));

        // 3. Outgoing — Salaries
        const salaries = await Salary.find({
            status: 'paid',
            paidAt: { $gte: startDate, $lte: endDate }
        }).populate('teacher', 'name subject').sort({ paidAt: 1 });

        const outgoingSalaries = salaries.map(s => ({
            _id: s._id,
            type: 'outgoing',
            category: 'Salary',
            description: `${s.teacher?.name || 'Teacher'} — ${s.teacher?.subject || ''}`,
            amount: s.amount,
            method: s.paymentMethod,
            date: s.paidAt,
            notes: s.notes || ''
        }));

        // Combine and sort by date
        const allEntries = [...received, ...outgoingExpenses, ...outgoingSalaries]
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Totals
        const totalReceived = received.reduce((sum, r) => sum + r.amount, 0);
        const totalOutgoing = [...outgoingExpenses, ...outgoingSalaries].reduce((sum, o) => sum + o.amount, 0);

        res.json({
            entries: allEntries,
            summary: {
                totalReceived,
                totalOutgoing,
                netBalance: totalReceived - totalOutgoing,
                receivedCount: received.length,
                outgoingCount: outgoingExpenses.length + outgoingSalaries.length
            },
            dateRange: { from: startDate, to: endDate }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
