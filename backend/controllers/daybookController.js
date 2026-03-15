const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Salary = require('../models/Salary');

// @desc    Get day book entries for a date range
// @route   GET /api/daybook?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Admin
exports.getDayBook = async (req, res) => {
    try {
        const { from, to } = req.query;

        // Build date range with safe parsing
        const startDate = new Date(from || new Date().toISOString().split('T')[0]);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(to || from || new Date().toISOString().split('T')[0]);
        endDate.setHours(23, 59, 59, 999);

        // 1. Received — Fee Payments (status = 'paid')
        let received = [];
        try {
            const payments = await Payment.find({
                status: 'paid',
                createdAt: { $gte: startDate, $lte: endDate }
            }).populate({
                path: 'admission',
                select: 'name studentId courseApplied',
                populate: { path: 'courseApplied', select: 'name' }
            }).sort({ createdAt: 1 }).lean();

            received = payments.map(p => ({
                _id: p._id,
                type: 'received',
                category: 'Fee Payment',
                description: `${p.admission?.name || 'Student'} — ${p.admission?.courseApplied?.name || 'Course'}`,
                studentId: p.admission?.studentId || '',
                amount: p.amount || 0,
                method: p.paymentMethod || '',
                date: p.createdAt
            }));
        } catch (err) {
            console.error('DayBook - Payment query error:', err.message);
        }

        // 2. Outgoing — Expenses
        let outgoingExpenses = [];
        try {
            const expenses = await Expense.find({
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 }).lean();

            outgoingExpenses = expenses.map(e => ({
                _id: e._id,
                type: 'outgoing',
                category: e.category || 'Other',
                description: e.title || 'Expense',
                amount: e.amount || 0,
                method: '',
                date: e.date
            }));
        } catch (err) {
            console.error('DayBook - Expense query error:', err.message);
        }

        // 3. Outgoing — Salaries
        let outgoingSalaries = [];
        try {
            const salaries = await Salary.find({
                status: 'paid',
                paidAt: { $gte: startDate, $lte: endDate }
            }).populate('teacher', 'name subject').sort({ paidAt: 1 }).lean();

            outgoingSalaries = salaries.map(s => ({
                _id: s._id,
                type: 'outgoing',
                category: 'Salary',
                description: `${s.teacher?.name || 'Teacher'} — ${s.teacher?.subject || ''}`,
                amount: s.amount || 0,
                method: s.paymentMethod || '',
                date: s.paidAt
            }));
        } catch (err) {
            console.error('DayBook - Salary query error:', err.message);
        }

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
        console.error('DayBook error:', error);
        res.status(500).json({ message: error.message });
    }
};
