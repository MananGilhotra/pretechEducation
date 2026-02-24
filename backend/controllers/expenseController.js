const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get total expenses amount
// @route   GET /api/expenses/total
exports.getTotalExpenses = async (req, res) => {
    try {
        const result = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        res.json({ total: result.length > 0 ? result[0].total : 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new expense
// @route   POST /api/expenses
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ message: 'Title and amount are required' });
        }

        const expense = await Expense.create({
            title,
            amount: Number(amount),
            category: category || 'Other',
            date: date || new Date(),
            notes: notes || '',
            createdBy: req.user._id
        });

        res.status(201).json({ message: 'Expense added', expense });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const { title, amount, category, date, notes } = req.body;
        if (title !== undefined) expense.title = title;
        if (amount !== undefined) expense.amount = Number(amount);
        if (category !== undefined) expense.category = category;
        if (date !== undefined) expense.date = new Date(date);
        if (notes !== undefined) expense.notes = notes;

        await expense.save();
        res.json({ message: 'Expense updated', expense });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
