import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiCurrencyRupee, HiSearch, HiCheckCircle, HiX, HiUsers } from 'react-icons/hi';
import { MdPayment } from 'react-icons/md';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const METHOD_OPTIONS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

const statusColor = (s) => {
    if (s === 'Paid') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (s === 'Partially Paid') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (s === 'Failed') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
};

const ManageFees = () => {
    // Overview state
    const [overview, setOverview] = useState(null);
    const [loadingOverview, setLoadingOverview] = useState(true);

    // Search state
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState(null);

    // Fee summary state
    const [feeSummary, setFeeSummary] = useState(null);
    const [admissionData, setAdmissionData] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Form state
    const [form, setForm] = useState({ amount: '', paymentMethod: 'Cash', transactionId: '', notes: '', paymentDate: new Date().toISOString().split('T')[0] });
    const [submitting, setSubmitting] = useState(false);
    const [updatingInstallment, setUpdatingInstallment] = useState(null);

    const debounceRef = useRef(null);

    // Fetch fee overview on mount
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const { data } = await API.get('/payments/overview');
                setOverview(data);
            } catch { setOverview(null); }
            finally { setLoadingOverview(false); }
        };
        fetchOverview();
    }, []);

    // Debounce search
    useEffect(() => {
        if (query.trim().length < 2) { setSuggestions([]); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoadingSuggestions(true);
            try {
                const { data } = await API.get('/admissions', { params: { search: query } });
                setSuggestions(data.slice(0, 8));
            } catch { setSuggestions([]); }
            finally { setLoadingSuggestions(false); }
        }, 350);
    }, [query]);

    const selectStudent = async (admission) => {
        setSelectedAdmission(admission);
        setSuggestions([]);
        setQuery(admission.name);
        await loadSummary(admission._id);
    };

    const loadSummary = async (admissionId) => {
        setLoadingSummary(true);
        setFeeSummary(null);
        setPaymentHistory([]);
        setAdmissionData(null);
        try {
            const { data } = await API.get(`/payments/summary/${admissionId}`);
            setFeeSummary(data.feeSummary);
            setAdmissionData(data.admission);
            setPaymentHistory(data.payments || []);
        } catch { toast.error('Could not load fee summary'); }
        finally { setLoadingSummary(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAdmission) return toast.error('Please select a student first');
        if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
        setSubmitting(true);
        try {
            const { data } = await API.post('/payments/record', {
                admissionId: selectedAdmission._id,
                amount: Number(form.amount),
                paymentMethod: form.paymentMethod,
                transactionId: form.transactionId,
                notes: form.notes,
                paymentDate: form.paymentDate
            });
            toast.success('Payment recorded!');
            setFeeSummary(data.feeSummary);
            setForm({ amount: '', paymentMethod: 'Cash', transactionId: '', notes: '', paymentDate: new Date().toISOString().split('T')[0] });
            await loadSummary(selectedAdmission._id);
            // Refresh overview
            try { const { data: o } = await API.get('/payments/overview'); setOverview(o); } catch { }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        } finally { setSubmitting(false); }
    };

    const handleInstallmentToggle = async (installment) => {
        if (!admissionData) return;
        const newStatus = installment.status === 'Paid' ? 'Pending' : 'Paid';
        setUpdatingInstallment(installment.number);
        try {
            const { data } = await API.put(`/payments/installment/${admissionData._id}/${installment.number}`, { status: newStatus });
            toast.success(data.message);
            setAdmissionData(data.admission);
            setFeeSummary(data.feeSummary);
            setPaymentHistory(data.payments || []);
            // Refresh overview
            try { const { data: o } = await API.get('/payments/overview'); setOverview(o); } catch { }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update installment');
        } finally { setUpdatingInstallment(null); }
    };

    const clearStudent = () => {
        setSelectedAdmission(null);
        setFeeSummary(null);
        setAdmissionData(null);
        setPaymentHistory([]);
        setQuery('');
        setSuggestions([]);
    };

    return (
        <>
            <Helmet><title>Manage Fees | Admin</title></Helmet>
            <div className="pt-24 pb-10 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                            <MdPayment className="text-primary-700 dark:text-primary-400" />
                            Manage Fees
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Record fee payments, manage installments, and view fee overview.</p>
                    </div>

                    {/* ======================== FEE OVERVIEW ======================== */}
                    {!loadingOverview && overview && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <HiUsers className="text-primary-600" /> Fee Overview
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="card !p-4 text-center">
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{overview.totalStudents}</div>
                                    <div className="text-xs text-gray-500 mt-1">Total Students</div>
                                </div>
                                <div className="card !p-4 text-center border-l-4 border-green-500">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{overview.fullyPaid}</div>
                                    <div className="text-xs text-gray-500 mt-1">Fully Paid</div>
                                </div>
                                <div className="card !p-4 text-center border-l-4 border-yellow-500">
                                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{overview.partiallyPaid}</div>
                                    <div className="text-xs text-gray-500 mt-1">Partially Paid</div>
                                </div>
                                <div className="card !p-4 text-center border-l-4 border-red-500">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{overview.pending}</div>
                                    <div className="text-xs text-gray-500 mt-1">Pending</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <div className="card !p-4 text-center">
                                    <div className="text-xs text-gray-500 mb-1">Total Fees (All Students)</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">₹{overview.totalFeesAll.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="card !p-4 text-center bg-green-50 dark:bg-green-900/20">
                                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">Total Collected</div>
                                    <div className="text-xl font-bold text-green-700 dark:text-green-400">₹{overview.totalCollected.toLocaleString('en-IN')}</div>
                                </div>
                                <div className={`card !p-4 text-center ${overview.totalDue > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                                    <div className={`text-xs mb-1 ${overview.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Total Due</div>
                                    <div className={`text-xl font-bold ${overview.totalDue > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                        {overview.totalDue === 0 ? '✅ All Clear' : `₹${overview.totalDue.toLocaleString('en-IN')}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================== STUDENT SEARCH ======================== */}
                    <div className="card mb-6">
                        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Step 1 — Search Student</h2>
                        <div className="relative">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => { setQuery(e.target.value); if (selectedAdmission) clearStudent(); }}
                                placeholder="Type student name or ID…"
                                className="input-field !pl-11 pr-10"
                                autoComplete="off"
                            />
                            {(query || selectedAdmission) && (
                                <button onClick={clearStudent} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><HiX /></button>
                            )}
                            {suggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl overflow-hidden">
                                    {loadingSuggestions && <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>}
                                    {suggestions.map(adm => (
                                        <button key={adm._id} onClick={() => selectStudent(adm)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center justify-between border-b border-gray-100 dark:border-dark-border last:border-0 transition-colors">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">{adm.name}</div>
                                                <div className="text-xs text-gray-500">{adm.studentId} · {adm.courseApplied?.name || 'N/A'}</div>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(adm.paymentStatus)}`}>{adm.paymentStatus}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ======================== LOADING ======================== */}
                    {loadingSummary && <div className="card text-center py-10 text-gray-500 dark:text-gray-400">Loading fee details…</div>}

                    {/* ======================== STUDENT FEE DETAILS ======================== */}
                    {selectedAdmission && feeSummary && admissionData && !loadingSummary && (
                        <>
                            {/* Student Info Card */}
                            <div className="card mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{admissionData.name}</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            <span className="font-mono text-primary-700 dark:text-primary-400">{admissionData.studentId}</span>
                                            {' · '}{admissionData.courseApplied?.name || 'N/A'}
                                            {' · '}{admissionData.mobile}
                                            {admissionData.paymentPlan === 'Installment' && <span className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">Installment Plan</span>}
                                        </p>
                                    </div>
                                    <span className={`self-start text-sm px-3 py-1 rounded-full font-semibold ${statusColor(feeSummary.paymentStatus)}`}>
                                        {feeSummary.paymentStatus}
                                    </span>
                                </div>

                                {/* Fee summary grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 text-center">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Fees</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{feeSummary.totalFees.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                                        <div className="text-xs text-green-600 dark:text-green-400 mb-1">Amount Paid</div>
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">₹{feeSummary.totalPaid.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className={`rounded-xl p-4 text-center ${feeSummary.balanceDue === 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <div className={`text-xs mb-1 ${feeSummary.balanceDue === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Balance Due</div>
                                        <div className={`text-2xl font-bold ${feeSummary.balanceDue === 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {feeSummary.balanceDue === 0 ? <span className="flex items-center justify-center gap-1"><HiCheckCircle /> Cleared</span> : <>₹{feeSummary.balanceDue.toLocaleString('en-IN')}</>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ======================== INSTALLMENT MANAGEMENT ======================== */}
                            {admissionData.paymentPlan === 'Installment' && admissionData.installments?.length > 0 && (
                                <div className="card mb-6">
                                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Installment Status</h2>
                                    <div className="space-y-3">
                                        {admissionData.installments
                                            .sort((a, b) => a.number - b.number)
                                            .map((inst) => (
                                                <div key={inst.number}
                                                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${inst.status === 'Paid'
                                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                        : 'border-gray-200 bg-white dark:border-dark-border dark:bg-dark-card'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${inst.status === 'Paid'
                                                            ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300'
                                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {inst.number}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                Installment #{inst.number}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ₹{inst.amount?.toLocaleString('en-IN')}
                                                                {inst.paidAt && <span className="ml-2 text-xs">· Paid on {new Date(inst.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleInstallmentToggle(inst)}
                                                        disabled={updatingInstallment === inst.number}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inst.status === 'Paid'
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-amber-100 hover:text-amber-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-400'
                                                            } disabled:opacity-50`}
                                                    >
                                                        {updatingInstallment === inst.number
                                                            ? 'Updating…'
                                                            : inst.status === 'Paid' ? '✓ Paid' : 'Mark as Paid'
                                                        }
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}

                            {/* ======================== PAYMENT ENTRY FORM ======================== */}
                            <div className="card mb-6">
                                <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                    {admissionData.paymentPlan === 'Installment' ? 'Record Additional Payment' : 'Step 2 — Record a Payment'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount Paid (₹) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <HiCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input type="number" min="1" step="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 5000" className="input-field !pl-9" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Method <span className="text-red-500">*</span></label>
                                            <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input-field">
                                                {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transaction / Reference ID <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <input type="text" value={form.transactionId} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="UTR / Cheque no. / etc." className="input-field" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Date</label>
                                            <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. First instalment" className="input-field" />
                                        </div>
                                    </div>
                                    {feeSummary.balanceDue > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs text-gray-500 self-center">Quick fill:</span>
                                            {[feeSummary.balanceDue, Math.ceil(feeSummary.balanceDue / 2), Math.ceil(feeSummary.balanceDue / 4)]
                                                .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
                                                .map(amt => (
                                                    <button key={amt} type="button" onClick={() => setForm(f => ({ ...f, amount: String(amt) }))}
                                                        className="text-xs px-3 py-1 rounded-lg border border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                                        ₹{amt.toLocaleString('en-IN')}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                    <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                                        {submitting ? 'Recording…' : 'Record Payment'}
                                    </button>
                                </form>
                            </div>

                            {/* ======================== PAYMENT HISTORY ======================== */}
                            {paymentHistory.length > 0 && (
                                <div className="card">
                                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">Payment History</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-400">#</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-400">Method</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-400">Reference</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-400">Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paymentHistory.map((p, idx) => (
                                                    <tr key={p._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                                        <td className="py-2.5 px-4 text-gray-500">{idx + 1}</td>
                                                        <td className="py-2.5 px-4 font-semibold text-gray-900 dark:text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                                                        <td className="py-2.5 px-4 text-gray-600 dark:text-gray-400">{p.paymentMethod}</td>
                                                        <td className="py-2.5 px-4 font-mono text-xs text-gray-500">{p.transactionId || '—'}</td>
                                                        <td className="py-2.5 px-4 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td className="py-2.5 px-4">
                                                            {p.status === 'paid' ? (
                                                                <a href={`/api/payments/${p._id}/receipt`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                    className="text-xs px-3 py-1 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-200 transition-colors font-medium">
                                                                    📄 Download
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManageFees;
