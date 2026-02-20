import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiUsers, HiQuestionMarkCircle, HiCurrencyRupee, HiBookOpen, HiArrowRight } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#1E40AF', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, recentRes] = await Promise.all([
                    API.get('/dashboard/stats'),
                    API.get('/dashboard/recent')
                ]);
                setStats(statsRes.data);
                setRecent(recentRes.data);
            } catch (err) {
                // Demo data
                setStats({
                    totalStudents: 156,
                    totalEnquiries: 89,
                    totalRevenue: 2340000,
                    activeCourses: 12,
                    monthlyRevenue: [
                        { month: '2026-01', revenue: 180000, admissions: 12 },
                        { month: '2026-02', revenue: 250000, admissions: 18 },
                    ],
                    admissionsByCourse: [
                        { _id: 'Web Development', count: 45 },
                        { _id: 'Python', count: 32 },
                        { _id: 'Data Science', count: 28 },
                        { _id: 'Tally', count: 22 },
                        { _id: 'Graphic Design', count: 18 },
                        { _id: 'Others', count: 11 },
                    ]
                });
                setRecent([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    const statCards = [
        { label: 'Total Students', value: stats?.totalStudents || 0, icon: HiUsers, color: 'from-blue-500 to-blue-700', link: '/admin/admissions' },
        { label: 'Total Enquiries', value: stats?.totalEnquiries || 0, icon: HiQuestionMarkCircle, color: 'from-purple-500 to-purple-700', link: '/admin/enquiries' },
        { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: HiCurrencyRupee, color: 'from-green-500 to-green-700', link: '/admin/payments' },
        { label: 'Active Courses', value: stats?.activeCourses || 0, icon: HiBookOpen, color: 'from-orange-500 to-orange-700', link: '/admin/courses' },
    ];

    return (
        <>
            <Helmet><title>Admin Dashboard | Pretech Computer Education</title></Helmet>

            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to Pretech Admin Panel</p>
                        </div>
                        <Link to="/admin/add-admission" className="btn-primary flex items-center justify-center space-x-2">
                            <span>+ New Admission</span>
                        </Link>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link to={stat.link} className="card group block">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                            <stat.icon className="text-white text-xl" />
                                        </div>
                                        <HiArrowRight className="text-gray-400 group-hover:text-primary-700 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <div className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Revenue Chart */}
                        <div className="card">
                            <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.monthlyRevenue || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" fill="#1E40AF" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Admissions by Course */}
                        <div className="card">
                            <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Admissions by Course</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.admissionsByCourse || []}
                                            dataKey="count"
                                            nameKey="_id"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ _id, count }) => `${_id}: ${count}`}
                                        >
                                            {(stats?.admissionsByCourse || []).map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Admissions */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">Recent Admissions</h3>
                            <Link to="/admin/admissions" className="text-sm text-primary-700 dark:text-primary-400 font-medium hover:underline">
                                View All →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">No recent admissions</td>
                                        </tr>
                                    ) : (
                                        recent.map((adm) => (
                                            <tr key={adm._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors">
                                                <td className="py-3 px-4 font-mono text-primary-700 dark:text-primary-400 font-medium">{adm.studentId}</td>
                                                <td className="py-3 px-4 text-gray-900 dark:text-white">{adm.name}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{adm.courseApplied?.name || 'N/A'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${adm.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        adm.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                        {adm.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{new Date(adm.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                            { label: 'Manage Courses', path: '/admin/courses', icon: '📚' },
                            { label: 'View Admissions', path: '/admin/admissions', icon: '📝' },
                            { label: 'View Enquiries', path: '/admin/enquiries', icon: '❓' },
                            { label: 'View Payments', path: '/admin/payments', icon: '💳' },
                            { label: 'Manage Fees', path: '/admin/fees', icon: '💰' },
                            { label: 'Installment Reports', path: '/admin/installments', icon: '📊' },
                        ].map((link, i) => (
                            <Link key={i} to={link.path} className="card-hover text-center">
                                <div className="text-3xl mb-2">{link.icon}</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
