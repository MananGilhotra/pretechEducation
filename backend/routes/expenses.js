const express = require('express');
const router = express.Router();
const { getExpenses, getTotalExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getExpenses);
router.get('/total', protect, authorize('admin'), getTotalExpenses);
router.post('/', protect, authorize('admin'), addExpense);
router.put('/:id', protect, authorize('admin'), updateExpense);
router.delete('/:id', protect, authorize('admin'), deleteExpense);

module.exports = router;
