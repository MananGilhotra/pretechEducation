import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiCurrencyRupee, HiCheck, HiX, HiDownload } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ViewPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        try { const { data } = await API.get('/payments'); setPayments(data); }
        catch { setPayments([]); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this payment?')) return;
        try {
            await API.put(`/payments/${id}/approve`);
            toast.success('Payment Approved');
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval Failed');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this payment?')) return;
        try {
            await API.put(`/payments/${id}/reject`);
            toast.success('Payment Rejected');
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Rejection Failed');
        }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return (
        <>
            <Helmet><title>Payments | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Payments</h1>
                            <p className="text-gray-500 mt-1">{payments.length} records</p>
                        </div>
                        <div className="card !p-4 flex items-center space-x-2">
                            <HiCurrencyRupee className="text-green-600 text-xl" />
                            <div>
                                <div className="text-xs text-gray-500">Total Revenue</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">₹{totalRevenue.toLocaleString('en-IN')}</div>
                            </div>
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
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No payments recorded</td></tr>
                                    ) : payments.map((pay) => (
                                        <tr key={pay._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                {pay.transactionId || pay.razorpayPaymentId || pay.stripeSessionId || 'N/A'}
                                                {pay.paymentMethod === 'Manual' && <span className="ml-2 text-[10px] bg-gray-100 px-1 rounded">Manual</span>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{pay.admission?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{pay.admission?.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 font-semibold">₹{pay.amount?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${pay.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    pay.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        pay.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-amber-100 text-amber-700'}`}>
                                                    {pay.status === 'pending_approval' ? 'Pending Approval' : pay.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{new Date(pay.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                {pay.status === 'pending_approval' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(pay._id)}
                                                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                            title="Approve Payment"
                                                        >
                                                            <HiCheck />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(pay._id)}
                                                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                            title="Reject Payment"
                                                        >
                                                            <HiX />
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
        </>
    );
};

export default ViewPayments;
