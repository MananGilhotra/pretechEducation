import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', duration: '', fees: '', eligibility: '', category: '', status: 'Active'
    });

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/courses');
            setCourses(data);
        } catch { setCourses([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await API.put(`/courses/${editing}`, { ...form, fees: Number(form.fees) });
                toast.success('Course updated!');
            } else {
                await API.post('/courses', { ...form, fees: Number(form.fees) });
                toast.success('Course created!');
            }
            setShowModal(false);
            setEditing(null);
            setForm({ name: '', description: '', duration: '', fees: '', eligibility: '', category: '', status: 'Active' });
            fetchCourses();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleEdit = (course) => {
        setEditing(course._id);
        setForm({ name: course.name, description: course.description, duration: course.duration, fees: course.fees, eligibility: course.eligibility, category: course.category, status: course.status });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await API.delete(`/courses/${id}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch { toast.error('Delete failed'); }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Manage Courses | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Manage Courses</h1>
                            <p className="text-gray-500 mt-1">{courses.length} courses total</p>
                        </div>
                        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', duration: '', fees: '', eligibility: '', category: 'Programming', status: 'Active' }); setShowModal(true); }} className="btn-primary">
                            <HiPlus className="mr-2" /> Add Course
                        </button>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Duration</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Fees</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{course.name}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{course.category}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{course.duration}</td>
                                            <td className="py-3 px-4 font-semibold">₹{course.fees?.toLocaleString('en-IN')}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleEdit(course)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"><HiPencil /></button>
                                                    <button onClick={() => handleDelete(course._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"><HiTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{editing ? 'Edit Course' : 'Add Course'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"><HiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Course Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows="3" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Duration</label>
                                    <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field" placeholder="e.g. 3 Months" required />
                                </div>
                                <div>
                                    <label className="label">Fees (₹)</label>
                                    <input type="number" value={form.fees} onChange={e => setForm({ ...form, fees: e.target.value })} className="input-field" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Eligibility</label>
                                <input value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="input-field" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category</label>
                                    <input list="categoryList" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="Type or select category" required />
                                    <datalist id="categoryList">
                                        {[...new Set(courses.map(c => c.category).filter(Boolean))].map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="label">Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full !py-3">{editing ? 'Update Course' : 'Create Course'}</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default ManageCourses;
