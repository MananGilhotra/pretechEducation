import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiUserGroup, HiPlus, HiPhone, HiTrash } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ViewTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        try {
            const { data } = await API.get('/teachers');
            setTeachers(data);
        } catch { setTeachers([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this teacher and all salary records?')) return;
        try {
            await API.delete(`/teachers/${id}`);
            toast.success('Teacher deleted');
            fetchTeachers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    const statusColor = (s) => {
        if (s === 'Active') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (s === 'On Leave') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    };

    return (
        <>
            <Helmet><title>Teachers | Admin Panel</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Teachers</h1>
                            <p className="text-sm text-gray-500">{teachers.length} teacher(s)</p>
                        </div>
                        <Link to="/admin/add-teacher" className="btn-primary flex items-center gap-2">
                            <HiPlus /> Add Teacher
                        </Link>
                    </div>

                    {teachers.length === 0 ? (
                        <div className="card text-center py-16">
                            <HiUserGroup className="text-5xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Teachers Yet</h3>
                            <p className="text-gray-500 mb-4">Add your first teacher to get started.</p>
                            <Link to="/admin/add-teacher" className="btn-primary">Add Teacher</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teachers.map((t, i) => (
                                <motion.div
                                    key={t._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="card group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                {t.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{t.name}</h3>
                                                <p className="text-xs text-gray-500">{t.subject}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(t.status)}`}>{t.status}</span>
                                    </div>

                                    <div className="space-y-1.5 text-sm mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1"><HiPhone className="text-xs" /> {t.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Monthly Salary</span>
                                            <span className="font-bold text-green-600">₹{t.monthlySalary?.toLocaleString('en-IN')}</span>
                                        </div>
                                        {t.qualification && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Qualification</span>
                                                <span className="text-gray-900 dark:text-white">{t.qualification}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Joined</span>
                                            <span className="text-gray-900 dark:text-white text-xs">{new Date(t.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
                                        <Link to={`/admin/salaries?teacher=${t._id}`} className="text-xs text-primary-700 dark:text-primary-400 font-medium hover:underline">
                                            View Salary →
                                        </Link>
                                        <button onClick={() => handleDelete(t._id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                                            <HiTrash className="text-base" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewTeachers;
