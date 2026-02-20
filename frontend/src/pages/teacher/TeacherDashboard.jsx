import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiCurrencyRupee, HiClock, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [teacher, setTeacher] = useState(null);
    const [salaries, setSalaries] = useState([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await API.get('/teachers/me');
                setTeacher(data.teacher);
                setSalaries(data.salaries || []);
                setTotalPaid(data.totalPaid || 0);
            } catch (err) {
                console.log('No teacher data:', err.response?.data?.message || err.message);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Teacher Dashboard | Pretech Computer Education</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Welcome, {user?.name} 👋</h1>
                        <p className="text-gray-500 mt-1">Your teacher dashboard</p>
                    </div>

                    {/* Profile Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                {teacher?.subject && <p className="text-sm text-primary-700 dark:text-primary-400 font-medium mt-1">{teacher.subject}</p>}
                            </div>
                        </div>
                    </motion.div>

                    {teacher ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Teacher Details */}
                            <div className="card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <HiUserGroup className="text-teal-600 text-xl" />
                                    <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">My Details</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Subject', value: teacher.subject },
                                        { label: 'Phone', value: teacher.phone },
                                        { label: 'Qualification', value: teacher.qualification || 'N/A' },
                                        { label: 'Status', value: teacher.status, badge: true },
                                        { label: 'Monthly Salary', value: `₹${teacher.monthlySalary?.toLocaleString('en-IN')}`, bold: true },
                                        { label: 'Total Received', value: `₹${totalPaid.toLocaleString('en-IN')}`, green: true },
                                        { label: 'Joined', value: new Date(teacher.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                                            {item.badge ? (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.value === 'Active' ? 'bg-green-100 text-green-700' :
                                                        item.value === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>{item.value}</span>
                                            ) : (
                                                <span className={`text-sm font-semibold ${item.green ? 'text-green-600 dark:text-green-400' : item.bold ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                                    {item.value || 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Salary History */}
                            <div className="card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <HiCurrencyRupee className="text-green-600 text-xl" />
                                    <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">Salary History</h3>
                                </div>
                                {salaries.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <HiClock className="text-3xl mx-auto mb-2 text-gray-400" />
                                        <p>No salary records yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {salaries.map((s) => (
                                            <div key={s._id} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">₹{s.amount?.toLocaleString('en-IN')}</div>
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{s.status}</span>
                                                </div>
                                                <p className="text-sm font-medium text-primary-700 dark:text-primary-400">{MONTH_NAMES[s.month - 1]} {s.year}</p>
                                                <p className="text-xs text-gray-500 mt-1">{s.paymentMethod} • {new Date(s.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <HiUserGroup className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Profile Found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Contact admin if you think this is an error.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherDashboard;
