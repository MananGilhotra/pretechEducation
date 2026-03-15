import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiArrowDown, HiArrowUp, HiCalendar, HiCurrencyRupee, HiDownload } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const DayBook = () => {
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState({ totalReceived: 0, totalOutgoing: 0, netBalance: 0, receivedCount: 0, outgoingCount: 0 });
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [filter, setFilter] = useState('all'); // all, received, outgoing

    const fetchDayBook = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/daybook?from=${fromDate}&to=${toDate}`);
            setEntries(data.entries);
            setSummary(data.summary);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load day book');
            setEntries([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchDayBook(); }, [fromDate, toDate]);

    const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.type === filter);

    const formatCurrency = (n) => `₹${n?.toLocaleString('en-IN') || 0}`;

    const quickDate = (type) => {
        const today = new Date();
        if (type === 'today') {
            const d = today.toISOString().split('T')[0];
            setFromDate(d);
            setToDate(d);
        } else if (type === 'week') {
            const start = new Date(today);
            start.setDate(today.getDate() - 6);
            setFromDate(start.toISOString().split('T')[0]);
            setToDate(today.toISOString().split('T')[0]);
        } else if (type === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            setFromDate(start.toISOString().split('T')[0]);
            setToDate(today.toISOString().split('T')[0]);
        }
    };

    const exportCSV = () => {
        if (filteredEntries.length === 0) { toast.error('No entries to export'); return; }
        const header = 'Date,Type,Category,Description,Amount,Method\n';
        const rows = filteredEntries.map(e => {
            const date = new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            return `${date},${e.type === 'received' ? 'Received' : 'Outgoing'},"${e.category}","${e.description}",${e.amount},"${e.method || ''}"`;
        }).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daybook_${fromDate}_to_${toDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Running balance
    let runningBalance = 0;

    return (
        <>
            <Helmet><title>Day Book | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">📒 Day Book</h1>
                            <p className="text-gray-500 mt-1">Track all received & outgoing transactions</p>
                        </div>
                        <button onClick={exportCSV} className="btn-outline self-start flex items-center gap-2 text-sm">
                            <HiDownload /> Export CSV
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                    <HiArrowDown className="text-xl text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Received</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.totalReceived)}</p>
                                    <p className="text-xs text-green-500">{summary.receivedCount} transaction{summary.receivedCount !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                    <HiArrowUp className="text-xl text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Outgoing</p>
                                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(summary.totalOutgoing)}</p>
                                    <p className="text-xs text-red-500">{summary.outgoingCount} transaction{summary.outgoingCount !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`card bg-gradient-to-br ${summary.netBalance >= 0 ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800' : 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${summary.netBalance >= 0 ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
                                    <HiCurrencyRupee className={`text-xl ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-wider ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>Net Balance</p>
                                    <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>{formatCurrency(Math.abs(summary.netBalance))}</p>
                                    <p className={`text-xs ${summary.netBalance >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>{summary.netBalance >= 0 ? 'Surplus' : 'Deficit'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="card mb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                            <div className="flex gap-3 flex-wrap">
                                <div>
                                    <label className="label text-xs">From</label>
                                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input-field" />
                                </div>
                                <div>
                                    <label className="label text-xs">To</label>
                                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input-field" />
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => quickDate('today')} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${fromDate === toDate && fromDate === new Date().toISOString().split('T')[0] ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-primary-400'}`}>Today</button>
                                <button onClick={() => quickDate('week')} className="px-3 py-2 rounded-lg text-xs font-medium border bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-primary-400 transition-colors">Last 7 Days</button>
                                <button onClick={() => quickDate('month')} className="px-3 py-2 rounded-lg text-xs font-medium border bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-primary-400 transition-colors">This Month</button>
                            </div>
                            <div className="flex gap-1 bg-gray-100 dark:bg-dark-bg rounded-lg p-1">
                                {['all', 'received', 'outgoing'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-white dark:bg-dark-card text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                        {f === 'all' ? 'All' : f === 'received' ? '↓ Received' : '↑ Outgoing'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Entries Table */}
                    {loading ? (
                        <div className="py-12"><LoadingSpinner /></div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="card text-center py-16">
                            <HiCalendar className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Transactions</h3>
                            <p className="text-gray-500">No transactions found for the selected date range</p>
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">#</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Description</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Method</th>
                                            <th className="text-right py-3 px-4 font-semibold text-green-600">Received</th>
                                            <th className="text-right py-3 px-4 font-semibold text-red-600">Outgoing</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEntries.map((entry, i) => {
                                            if (entry.type === 'received') runningBalance += entry.amount;
                                            else runningBalance -= entry.amount;

                                            return (
                                                <tr key={`${entry.type}-${entry._id}`} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors">
                                                    <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                                                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                        {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${entry.type === 'received' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {entry.type === 'received' ? '↓ Received' : '↑ Outgoing'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs font-medium text-gray-700 dark:text-gray-300">{entry.category}</td>
                                                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">{entry.description}</td>
                                                    <td className="py-3 px-4 text-xs text-gray-500">{entry.method || '—'}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-green-600">
                                                        {entry.type === 'received' ? formatCurrency(entry.amount) : ''}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-red-600">
                                                        {entry.type === 'outgoing' ? formatCurrency(entry.amount) : ''}
                                                    </td>
                                                    <td className={`py-3 px-4 text-right font-bold ${runningBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        {formatCurrency(Math.abs(runningBalance))}
                                                        <span className="text-[10px] ml-0.5">{runningBalance < 0 ? 'Dr' : 'Cr'}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50 dark:bg-dark-card border-t-2 border-gray-300 dark:border-gray-600">
                                            <td colSpan="6" className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white">Total</td>
                                            <td className="py-3 px-4 text-right text-sm font-bold text-green-700">{formatCurrency(summary.totalReceived)}</td>
                                            <td className="py-3 px-4 text-right text-sm font-bold text-red-700">{formatCurrency(summary.totalOutgoing)}</td>
                                            <td className={`py-3 px-4 text-right text-sm font-bold ${summary.netBalance >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                                                {formatCurrency(Math.abs(summary.netBalance))}
                                                <span className="text-xs ml-0.5">{summary.netBalance < 0 ? 'Dr' : 'Cr'}</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DayBook;
