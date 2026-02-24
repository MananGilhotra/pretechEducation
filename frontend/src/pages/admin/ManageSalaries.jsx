import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiCurrencyRupee, HiSearch, HiCheckCircle, HiUserGroup, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const METHOD_OPTIONS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

const ManageSalaries = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [overview, setOverview] = useState(null);

    const now = new Date();
    const [form, setForm] = useState({
        amount: '',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        paymentMethod: 'Cash',
        transactionId: '',
        notes: '',
        paidAt: now.toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        const fetch = async () => {
            try {
                const [tRes, oRes] = await Promise.all([
                    API.get('/teachers'),
                    API.get('/teachers/salary-overview')
                ]);
                setTeachers(tRes.data);
                setOverview(oRes.data);
            } catch { }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const selectTeacher = async (teacher) => {
        setSelectedTeacher(teacher);
        setForm(f => ({ ...f, amount: String(teacher.monthlySalary || '') }));
        setLoadingDetail(true);
        try {
            const { data } = await API.get(`/teachers/${teacher._id}`);
            setSalaryHistory(data.salaries || []);
            setTotalPaid(data.totalPaid || 0);
        } catch { setSalaryHistory([]); setTotalPaid(0); }
        finally { setLoadingDetail(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeacher) return toast.error('Select a teacher first');
        if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter valid amount');
        setSubmitting(true);
        try {
            await API.post('/teachers/salary', {
                teacherId: selectedTeacher._id,
                amount: Number(form.amount),
                month: Number(form.month),
                year: Number(form.year),
                paymentMethod: form.paymentMethod,
                transactionId: form.transactionId,
                notes: form.notes,
                paidAt: form.paidAt
            });
            toast.success('Salary recorded!');
            setForm(f => ({ ...f, transactionId: '', notes: '' }));
            await selectTeacher(selectedTeacher);
            // Refresh overview
            try { const { data } = await API.get('/teachers/salary-overview'); setOverview(data); } catch { }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record salary');
        } finally { setSubmitting(false); }
    };

    const startEditSalary = (s) => {
        setEditingSalary(s._id);
        setEditForm({
            amount: s.amount,
            month: s.month,
            year: s.year,
            paymentMethod: s.paymentMethod || 'Cash',
            notes: s.notes || '',
            paidAt: s.paidAt ? new Date(s.paidAt).toISOString().split('T')[0] : ''
        });
    };

    const handleUpdateSalary = async () => {
        try {
            await API.put(`/teachers/salary/${editingSalary}`, editForm);
            toast.success('Salary updated');
            setEditingSalary(null);
            await selectTeacher(selectedTeacher);
            try { const { data } = await API.get('/teachers/salary-overview'); setOverview(data); } catch { }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteSalary = async () => {
        try {
            await API.delete(`/teachers/salary/${deleteModal.id}`);
            toast.success('Salary record deleted');
            setDeleteModal({ isOpen: false, id: null });
            await selectTeacher(selectedTeacher);
            try { const { data } = await API.get('/teachers/salary-overview'); setOverview(data); } catch { }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Manage Salaries | Admin Panel</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6">Manage Salaries</h1>

                    {/* Overview Cards */}
                    {overview && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Active Teachers', value: overview.totalTeachers, color: 'text-teal-600' },
                                { label: 'Total Salary Paid', value: `₹${overview.totalSalaryPaid?.toLocaleString('en-IN')}`, color: 'text-red-600' },
                                { label: 'This Month Paid', value: `₹${overview.paidThisMonthAmount?.toLocaleString('en-IN')}`, color: 'text-green-600' },
                                { label: 'Pending This Month', value: overview.pendingThisMonth, color: 'text-amber-600' },
                            ].map((c, i) => (
                                <div key={i} className="card text-center">
                                    <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                                    <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 1: Select Teacher */}
                    <div className="card mb-6">
                        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Step 1 — Select Teacher</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {teachers.map(t => (
                                <button key={t._id}
                                    onClick={() => selectTeacher(t)}
                                    className={`p-3 rounded-xl border text-left transition-all ${selectedTeacher?._id === t._id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300'
                                        : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
                                        }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                                            {t.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</div>
                                            <div className="text-xs text-gray-500">{t.subject} • ₹{t.monthlySalary?.toLocaleString('en-IN')}/mo</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Record Salary */}
                    {selectedTeacher && (
                        <>
                            <div className="card mb-6">
                                <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                    Step 2 — Record Salary for {selectedTeacher.name}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹) *</label>
                                            <div className="relative">
                                                <HiCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field !pl-9" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Month *</label>
                                            <select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="input-field">
                                                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year *</label>
                                            <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method</label>
                                            <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field">
                                                {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Date</label>
                                            <input type="date" value={form.paidAt} onChange={e => setForm(f => ({ ...f, paidAt: e.target.value }))} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reference / Notes</label>
                                            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" className="input-field" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                        <HiCurrencyRupee /> {submitting ? 'Recording...' : 'Record Salary'}
                                    </button>
                                </form>
                            </div>

                            {/* Salary History */}
                            {loadingDetail ? <LoadingSpinner /> : (
                                <div className="card">
                                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Salary History — {selectedTeacher.name}</h2>
                                    <p className="text-xs text-gray-500 mb-4">Total paid: ₹{totalPaid.toLocaleString('en-IN')}</p>

                                    {salaryHistory.length === 0 ? (
                                        <p className="text-center text-gray-400 py-6">No salary records yet</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-dark-border">
                                                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">#</th>
                                                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Month</th>
                                                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                                                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Method</th>
                                                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                                        <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {salaryHistory.map((s, i) => (
                                                        <tr key={s._id} className="border-b border-gray-100 dark:border-dark-border">
                                                            <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                                                            <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{MONTH_NAMES[s.month - 1]} {s.year}</td>
                                                            <td className="py-2.5 px-3 font-semibold text-green-600">₹{s.amount?.toLocaleString('en-IN')}</td>
                                                            <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">{s.paymentMethod}</td>
                                                            <td className="py-2.5 px-3 text-gray-500 text-xs">{new Date(s.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                            <td className="py-2.5 px-3">
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => startEditSalary(s)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Edit"><HiPencil /></button>
                                                                    <button onClick={() => setDeleteModal({ isOpen: true, id: s._id })} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Delete"><HiTrash /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Salary Modal */}
            {editingSalary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditingSalary(null)}>
                    <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Salary Record</h3>
                            <button onClick={() => setEditingSalary(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"><HiX /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (₹)</label>
                                <input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Month</label>
                                <select value={editForm.month} onChange={e => setEditForm({ ...editForm, month: e.target.value })} className="input-field">
                                    {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Year</label>
                                <input type="number" value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Method</label>
                                <select value={editForm.paymentMethod} onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })} className="input-field">
                                    {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Payment Date</label>
                                <input type="date" value={editForm.paidAt} onChange={e => setEditForm({ ...editForm, paidAt: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                                <input type="text" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="input-field" placeholder="Optional" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleUpdateSalary} className="btn-primary">Save Changes</button>
                            <button onClick={() => setEditingSalary(null)} className="btn-outline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Salary Record"
                message="Are you sure you want to delete this salary record? This action cannot be undone."
                onConfirm={handleDeleteSalary}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                confirmText="Delete"
                confirmColor="red"
            />
        </>
    );
};

export default ManageSalaries;
