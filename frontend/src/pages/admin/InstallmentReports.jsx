import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiSearch, HiCurrencyRupee, HiCheckCircle, HiExclamationCircle, HiDownload } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const InstallmentReports = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            const { data: admissions } = await API.get('/admissions');

            // For each admission, fetch fee summary (which uses actual Payment records)
            const enriched = await Promise.all(
                admissions.map(async (student) => {
                    try {
                        const { data } = await API.get(`/payments/summary/${student._id}`);
                        return {
                            ...student,
                            totalFees: data.feeSummary.totalFees,
                            grossFees: data.feeSummary.grossFees || data.feeSummary.totalFees,
                            discount: data.feeSummary.discount || 0,
                            paidAmount: data.feeSummary.totalPaid,
                            balance: data.feeSummary.balanceDue,
                            paymentCount: data.payments?.length || 0,
                            lastPayment: data.payments?.[0] || null
                        };
                    } catch {
                        return {
                            ...student,
                            totalFees: student.finalFees || 0,
                            grossFees: student.finalFees || 0,
                            discount: 0,
                            paidAmount: 0,
                            balance: student.finalFees || 0,
                            paymentCount: 0,
                            lastPayment: null
                        };
                    }
                })
            );

            // Sort: students with balance due first
            enriched.sort((a, b) => b.balance - a.balance);
            setStudents(enriched);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    const totalBalance = filteredStudents.reduce((sum, s) => sum + s.balance, 0);
    const totalPaid = filteredStudents.reduce((sum, s) => sum + s.paidAmount, 0);
    const pendingCount = filteredStudents.filter(s => s.balance > 0).length;

    const handleExport = () => {
        const headers = ['Student ID', 'Name', 'Course', 'Total Fees', 'Discount', 'Paid', 'Balance', 'Last Payment Date', 'Last Payment Amount', 'Status'];
        const rows = filteredStudents.map(s => [
            s.studentId || '',
            s.name || '',
            s.courseApplied?.name || '',
            s.totalFees || 0,
            s.discount || 0,
            s.paidAmount || 0,
            s.balance || 0,
            s.lastPayment ? new Date(s.lastPayment.createdAt).toLocaleDateString('en-IN') : '',
            s.lastPayment?.amount || '',
            s.balance === 0 ? 'Cleared' : 'Pending'
        ]);
        const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'installment_report.csv'; a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported');
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Installment Reports | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Payment Reports</h1>
                            <p className="text-gray-500 mt-1">Track fees, payments, and pending balances</p>
                        </div>
                        <button onClick={handleExport} className="btn-outline self-start"><HiDownload className="mr-2" /> Export CSV</button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="card text-center">
                            <div className="text-xs text-gray-500 mb-1">Total Students</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredStudents.length}</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-xs text-green-600 mb-1">Total Collected</div>
                            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-xs text-red-600 mb-1">Total Pending</div>
                            <div className="text-2xl font-bold text-red-600">₹{totalBalance.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="card text-center">
                            <div className="text-xs text-amber-600 mb-1">Students with Balance</div>
                            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student by name or ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input-field !pl-11"
                            />
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Total Fees</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Discount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Paid</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Balance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Last Payment</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr><td colSpan="8" className="text-center py-8 text-gray-500">No students found</td></tr>
                                    ) : filteredStudents.map((student) => (
                                        <tr key={student._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{student.studentId}</div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 font-medium">₹{student.totalFees?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4 text-amber-600">
                                                {student.discount > 0 ? `₹${student.discount.toLocaleString('en-IN')}` : '—'}
                                            </td>
                                            <td className="py-3 px-4 text-green-600 font-semibold">₹{student.paidAmount.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4 font-bold text-red-600">
                                                {student.balance === 0 ? <span className="text-green-600">₹0</span> : `₹${student.balance.toLocaleString('en-IN')}`}
                                            </td>
                                            <td className="py-3 px-4">
                                                {student.lastPayment ? (
                                                    <div>
                                                        <div className="font-medium text-xs">₹{student.lastPayment.amount?.toLocaleString('en-IN')}</div>
                                                        <div className="text-xs text-gray-500">{new Date(student.lastPayment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No payments</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                                    ${student.balance === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {student.balance === 0 ? '✓ Cleared' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InstallmentReports;
