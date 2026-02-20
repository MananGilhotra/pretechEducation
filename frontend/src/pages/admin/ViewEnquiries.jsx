import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiTrash } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ViewEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEnquiries = async () => {
        try { const { data } = await API.get('/enquiries'); setEnquiries(data); }
        catch { setEnquiries([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEnquiries(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this enquiry?')) return;
        try { await API.delete(`/enquiries/${id}`); toast.success('Deleted'); fetchEnquiries(); }
        catch { toast.error('Delete failed'); }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>View Enquiries | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Enquiries</h1>
                        <p className="text-gray-500 mt-1">{enquiries.length} enquiries received</p>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Mobile</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Batch</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Message</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enquiries.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No enquiries</td></tr>
                                    ) : enquiries.map((enq) => (
                                        <tr key={enq._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{enq.fullName}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{enq.mobile}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{enq.courseInterested}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{enq.preferredBatchTime}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px] truncate">{enq.message || '—'}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{new Date(enq.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                <button onClick={() => handleDelete(enq._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"><HiTrash /></button>
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

export default ViewEnquiries;
