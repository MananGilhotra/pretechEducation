import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiDownload, HiSearch, HiExclamationCircle } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const InstallmentReports = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchInstallmentStudents = async () => {
        try {
            // Fetch all admissions and filter on client side for now
            const { data } = await API.get('/admissions');

            // Filter only students with Installment plan
            const installmentStudents = data.filter(s => s.paymentPlan === 'Installment').map(student => {
                // Calculate paid amount
                const paidAmount = student.installments
                    ? student.installments.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0)
                    : 0;

                // Calculate balance
                const balance = (student.finalFees || 0) - paidAmount;

                // Find next due
                const nextDue = student.installments?.find(i => i.status === 'Pending');

                return {
                    ...student,
                    paidAmount,
                    balance,
                    nextDue
                };
            });

            setStudents(installmentStudents);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstallmentStudents();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Installment Reports | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Installment Reports</h1>
                            <p className="text-gray-500 mt-1">Track pending balances and installment status</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student..."
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
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Paid Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Balance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Next Installment</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No installment students found</td></tr>
                                    ) : filteredStudents.map((student) => (
                                        <tr key={student._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{student.studentId}</div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 font-medium">₹{student.finalFees?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4 text-green-600">₹{student.paidAmount.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4 font-bold text-red-600">₹{student.balance.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4">
                                                {student.nextDue ? (
                                                    <div>
                                                        <div className="font-medium">Installment {student.nextDue.number}</div>
                                                        <div className="text-xs text-gray-500">₹{student.nextDue.amount}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-green-500 text-xs">All Paid</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                                    ${student.balance === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {student.balance === 0 ? 'Fully Paid' : 'Pending'}
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
