import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiUser, HiAcademicCap, HiCurrencyRupee, HiDownload, HiClock } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [admission, setAdmission] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [admRes, payRes] = await Promise.all([
                    API.get('/admissions/me'),
                    API.get('/payments/me')
                ]);
                setAdmission(admRes.data);
                setPayments(payRes.data);
            } catch (err) {
                console.log('No admission data yet');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Student Dashboard | Pretech Computer Education</title></Helmet>

            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Welcome, {user?.name} 👋</h1>
                        <p className="text-gray-500 mt-1">Your student dashboard</p>
                    </div>

                    {/* Profile Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                {user?.studentId && (
                                    <p className="text-sm font-mono font-bold text-primary-700 dark:text-primary-400 mt-1">{user.studentId}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {admission ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Admission Details */}
                            <div className="card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <HiAcademicCap className="text-primary-700 text-xl" />
                                    <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">Admission Details</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Student ID', value: admission.studentId, mono: true },
                                        { label: 'Course', value: admission.courseApplied?.name },
                                        { label: 'Duration', value: admission.courseApplied?.duration },
                                        { label: 'Batch', value: admission.batchTiming },
                                        { label: 'Status', value: admission.paymentStatus, badge: true },
                                        { label: 'Approved', value: admission.approved ? '✓ Yes' : 'Pending' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                                            {item.badge ? (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.value === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        item.value === 'Failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                    }`}>{item.value}</span>
                                            ) : (
                                                <span className={`text-sm font-semibold text-gray-900 dark:text-white ${item.mono ? 'font-mono text-primary-700 dark:text-primary-400' : ''}`}>
                                                    {item.value || 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <HiCurrencyRupee className="text-green-600 text-xl" />
                                    <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">Payment History</h3>
                                </div>
                                {payments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <HiClock className="text-3xl mx-auto mb-2 text-gray-400" />
                                        <p>No payments recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {payments.map((pay) => (
                                            <div key={pay._id} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">₹{pay.amount?.toLocaleString('en-IN')}</div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${pay.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{pay.status}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-mono">{pay.razorpayPaymentId || pay.razorpayOrderId}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(pay.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                {pay.receiptUrl && (
                                                    <a href={pay.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary-700 dark:text-primary-400 font-medium mt-2 hover:underline">
                                                        <HiDownload className="mr-1" /> Download Receipt
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <HiAcademicCap className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Admission Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't applied for any course yet.</p>
                            <a href="/admission" className="btn-primary">Apply Now</a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentDashboard;
