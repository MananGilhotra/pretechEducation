import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiCurrencyRupee, HiCheck, HiX, HiDownload, HiSearch, HiFilter } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const ViewPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalSalary, setTotalSalary] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [methodFilter, setMethodFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchPayments = async () => {
        try { const { data } = await API.get('/payments'); setPayments(data); }
        catch { setPayments([]); }
        finally { setLoading(false); }
    };

    const fetchExpensesTotal = async () => {
        try { const { data } = await API.get('/expenses/total'); setTotalExpenses(data.total || 0); }
        catch { setTotalExpenses(0); }
    };

    const fetchSalaryTotal = async () => {
        try { const { data } = await API.get('/teachers/salary-overview'); setTotalSalary(data.totalSalaryPaid || 0); }
        catch { setTotalSalary(0); }
    };

    useEffect(() => {
        fetchPayments();
        fetchExpensesTotal();
        fetchSalaryTotal();
    }, []);

    const handleConfirmAction = async () => {
        const { type, id } = confirmModal;
        try {
            await API.put(`/payments/${id}/${type}`);
            toast.success(type === 'approve' ? 'Payment Approved' : 'Payment Rejected');
            fetchPayments();
            setConfirmModal({ isOpen: false, type: null, id: null });
        } catch (err) {
            toast.error(err.response?.data?.message || `${type === 'approve' ? 'Approval' : 'Rejection'} Failed`);
        }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    // Apply filters
    const filtered = payments.filter(pay => {
        if (statusFilter && pay.status !== statusFilter) return false;
        if (methodFilter && pay.paymentMethod !== methodFilter) return false;
        if (courseFilter && (pay.admission?.courseApplied?.name || '') !== courseFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            const name = (pay.admission?.name || '').toLowerCase();
            const txn = (pay.transactionId || pay.razorpayPaymentId || pay.stripeSessionId || '').toLowerCase();
            const studentId = (pay.admission?.studentId || '').toLowerCase();
            if (!name.includes(s) && !txn.includes(s) && !studentId.includes(s)) return false;
        }
        if (dateFrom) {
            const payDate = new Date(pay.createdAt);
            if (payDate < new Date(dateFrom)) return false;
        }
        if (dateTo) {
            const payDate = new Date(pay.createdAt);
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (payDate > toDate) return false;
        }
        return true;
    });

    const grossRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const filteredTotal = filtered.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const netRevenue = grossRevenue - totalSalary - totalExpenses;

    // Unique courses from payments
    const courses = [...new Set(payments.map(p => p.admission?.courseApplied?.name).filter(Boolean))].sort();
    // Unique methods
    const methods = [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))].sort();

    const clearFilters = () => {
        setSearch(''); setStatusFilter(''); setMethodFilter(''); setCourseFilter(''); setDateFrom(''); setDateTo('');
    };

    const hasFilters = search || statusFilter || methodFilter || courseFilter || dateFrom || dateTo;

    return (
        <>
            <Helmet><title>Payments | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Payments</h1>
                            <p className="text-gray-500 mt-1">{payments.length} total records</p>
                        </div>
                    </div>

                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="card !p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                                <HiCurrencyRupee className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Gross Revenue</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">₹{grossRevenue.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                        <div className="card !p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
                                <HiCurrencyRupee className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Salary Paid</div>
                                <div className="text-lg font-bold text-orange-600">₹{totalSalary.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                        <div className="card !p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                                <HiCurrencyRupee className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Total Expenses</div>
                                <div className="text-lg font-bold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                        <div className="card !p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${netRevenue >= 0 ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'} flex items-center justify-center shadow-lg`}>
                                <HiCurrencyRupee className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Net Revenue</div>
                                <div className={`text-lg font-bold ${netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{netRevenue.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card !p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <HiFilter className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</span>
                            {hasFilters && (
                                <button onClick={clearFilters} className="ml-auto text-xs text-red-500 hover:underline">Clear All</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search name, ID, txn..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="input-field !pl-9 !py-2 text-xs"
                                />
                            </div>
                            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field !py-2 text-xs">
                                <option value="">All Courses</option>
                                {courses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field !py-2 text-xs">
                                <option value="">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="failed">Failed</option>
                                <option value="created">Created</option>
                            </select>
                            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="input-field !py-2 text-xs">
                                <option value="">All Methods</option>
                                {methods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="input-field !py-2 text-xs"
                                placeholder="From Date"
                                title="From Date"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="input-field !py-2 text-xs"
                                placeholder="To Date"
                                title="To Date"
                            />
                        </div>
                    </div>

                    {/* Filtered Summary */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                            <span className="text-xs text-gray-500">Showing:</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{filtered.length} payments</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <span className="text-xs text-green-600">Filtered Total:</span>
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">₹{filteredTotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Payment ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Method</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan="8" className="text-center py-8 text-gray-500">No payments found</td></tr>
                                    ) : filtered.map((pay) => (
                                        <tr key={pay._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                {pay.transactionId || pay.razorpayPaymentId || pay.stripeSessionId || 'N/A'}
                                                {pay.paymentMethod === 'Manual' && <span className="ml-2 text-[10px] bg-gray-100 dark:bg-dark-border px-1 rounded">Manual</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-gray-900 dark:text-white font-medium">{pay.admission?.name || 'N/A'}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{pay.admission?.studentId || ''}</div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{pay.admission?.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 font-semibold">₹{pay.amount?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4 text-xs text-gray-500">{pay.paymentMethod || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${pay.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    pay.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        pay.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-amber-100 text-amber-700'}`}>
                                                    {pay.status === 'pending_approval' ? 'Pending Approval' : pay.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{new Date(pay.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="py-3 px-4">
                                                {pay.status === 'pending_approval' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setConfirmModal({ isOpen: true, type: 'approve', id: pay._id })}
                                                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                            title="Approve Payment"
                                                        >
                                                            <HiCheck className="text-lg" />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmModal({ isOpen: true, type: 'reject', id: pay._id })}
                                                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                            title="Reject Payment"
                                                        >
                                                            <HiX className="text-lg" />
                                                        </button>
                                                    </div>
                                                )}
                                                {pay.status === 'paid' && (
                                                    <a
                                                        href={`${API.defaults.baseURL}/payments/${pay._id}/receipt`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 inline-flex items-center"
                                                        title="Download Receipt"
                                                    >
                                                        <HiDownload />
                                                    </a>
                                                )}
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
                isOpen={confirmModal.isOpen}
                title={confirmModal.type === 'approve' ? "Approve Payment" : "Reject Payment"}
                message={`Are you sure you want to ${confirmModal.type} this payment?`}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmModal({ isOpen: false, type: null, id: null })}
                confirmText={confirmModal.type === 'approve' ? "Approve" : "Reject"}
                confirmColor={confirmModal.type === 'approve' ? "green" : "red"}
            />
        </>
    );
};

export default ViewPayments;
