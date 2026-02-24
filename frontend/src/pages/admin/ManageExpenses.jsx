import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiX, HiCurrencyRupee, HiFilter } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const CATEGORIES = ['Rent', 'Utilities', 'Stationery', 'Maintenance', 'Marketing', 'Transport', 'Food', 'Equipment', 'Other'];

const CATEGORY_COLORS = {
    Rent: 'bg-blue-100 text-blue-700',
    Utilities: 'bg-yellow-100 text-yellow-700',
    Stationery: 'bg-purple-100 text-purple-700',
    Maintenance: 'bg-orange-100 text-orange-700',
    Marketing: 'bg-pink-100 text-pink-700',
    Transport: 'bg-teal-100 text-teal-700',
    Food: 'bg-green-100 text-green-700',
    Equipment: 'bg-indigo-100 text-indigo-700',
    Other: 'bg-gray-100 text-gray-700',
};

const emptyForm = { title: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0], notes: '' };

const ManageExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchExpenses = async () => {
        try { const { data } = await API.get('/expenses'); setExpenses(data); }
        catch { setExpenses([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return toast.error('Title and amount are required');

        try {
            if (editingId) {
                await API.put(`/expenses/${editingId}`, form);
                toast.success('Expense updated');
            } else {
                await API.post('/expenses', form);
                toast.success('Expense added');
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ ...emptyForm });
            fetchExpenses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const startEdit = (exp) => {
        setEditingId(exp._id);
        setForm({
            title: exp.title,
            amount: exp.amount,
            category: exp.category,
            date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
            notes: exp.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/expenses/${deleteModal.id}`);
            toast.success('Expense deleted');
            fetchExpenses();
            setDeleteModal({ isOpen: false, id: null });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyForm });
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    // Apply filters
    const filtered = expenses.filter(exp => {
        if (categoryFilter && exp.category !== categoryFilter) return false;
        if (dateFrom && new Date(exp.date) < new Date(dateFrom)) return false;
        if (dateTo) {
            const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
            if (new Date(exp.date) > to) return false;
        }
        return true;
    });

    const totalExpenses = filtered.reduce((sum, e) => sum + e.amount, 0);

    // Category-wise breakdown
    const categoryBreakdown = {};
    filtered.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    return (
        <>
            <Helmet><title>Expenses | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Expenses</h1>
                            <p className="text-gray-500 mt-1">{expenses.length} total records</p>
                        </div>
                        <button onClick={() => { cancelForm(); setShowForm(true); }} className="btn-primary self-start flex items-center gap-2">
                            <HiPlus /> Add Expense
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="card !p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                                <HiCurrencyRupee className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Total Expenses</div>
                                <div className="text-lg font-bold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                        {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, amt]) => (
                            <div key={cat} className="card !p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700'}`}>
                                    {cat.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">{cat}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">₹{amt.toLocaleString('en-IN')}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="card !p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <HiFilter className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-field !w-auto !py-2 text-xs">
                                <option value="">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field !w-auto !py-2 text-xs" title="From Date" />
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field !w-auto !py-2 text-xs" title="To Date" />
                            {(categoryFilter || dateFrom || dateTo) && (
                                <button onClick={() => { setCategoryFilter(''); setDateFrom(''); setDateTo(''); }} className="text-xs text-red-500 hover:underline self-center">Clear</button>
                            )}
                        </div>
                    </div>

                    {/* Add/Edit Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
                                        <button onClick={cancelForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"><HiX /></button>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                                                <input
                                                    type="text"
                                                    value={form.title}
                                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                                    className="input-field"
                                                    placeholder="e.g. Monthly Rent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (₹) *</label>
                                                <input
                                                    type="number"
                                                    value={form.amount}
                                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                                    className="input-field"
                                                    placeholder="5000"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                                            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" placeholder="Optional notes..." />
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="submit" className="btn-primary">{editingId ? 'Update Expense' : 'Add Expense'}</button>
                                            <button type="button" onClick={cancelForm} className="btn-outline">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Expenses Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Title</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Notes</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-8 text-gray-500">No expenses found</td></tr>
                                    ) : filtered.map((exp) => (
                                        <tr key={exp._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{exp.title}</td>
                                            <td className="py-3 px-4 font-semibold text-red-600">₹{exp.amount?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${CATEGORY_COLORS[exp.category] || 'bg-gray-100 text-gray-700'}`}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">
                                                {exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px] truncate">{exp.notes || '—'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-1">
                                                    <button onClick={() => startEdit(exp)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Edit"><HiPencil /></button>
                                                    <button onClick={() => setDeleteModal({ isOpen: true, id: exp._id })} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Delete"><HiTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                confirmText="Delete"
                confirmColor="red"
            />
        </>
    );
};

export default ManageExpenses;
