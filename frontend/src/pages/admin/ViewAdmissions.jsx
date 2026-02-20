import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiSearch, HiDownload, HiCheck, HiX } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ViewAdmissions = () => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchAdmissions = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const { data } = await API.get('/admissions', { params });
            setAdmissions(data);
        } catch { setAdmissions([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAdmissions(); }, [search, statusFilter]);

    const handleApprove = async (id) => {
        try {
            await API.put(`/admissions/${id}/approve`);
            toast.success('Admission approved');
            fetchAdmissions();
        } catch { toast.error('Approval failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admission?')) return;
        try {
            await API.delete(`/admissions/${id}`);
            toast.success('Admission deleted');
            fetchAdmissions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleExport = async () => {
        try {
            const response = await API.get('/admissions/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a'); a.href = url; a.download = 'admissions.csv'; a.click();
            toast.success('CSV exported');
        } catch { toast.error('Export failed'); }
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>View Admissions | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Admissions</h1>
                            <p className="text-gray-500 mt-1">{admissions.length} records</p>
                        </div>
                        <button onClick={handleExport} className="btn-outline self-start"><HiDownload className="mr-2" /> Export CSV</button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search by name, ID, or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field !pl-11" />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field !w-auto">
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Payment</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Approved</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admissions.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No admissions found</td></tr>
                                    ) : admissions.map((adm) => (
                                        <tr key={adm._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4 font-mono text-primary-700 dark:text-primary-400 font-medium text-xs">{adm.studentId}</td>
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{adm.name}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{adm.email}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{adm.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${adm.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : adm.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{adm.paymentStatus}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {adm.approved ? <span className="text-green-600">✓ Yes</span> : <span className="text-gray-400">No</span>}
                                            </td>
                                            <td className="py-3 px-4 flex gap-1">
                                                {!adm.approved && (
                                                    <>
                                                        <button onClick={() => handleApprove(adm._id)} className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Approve"><HiCheck /></button>
                                                        <button onClick={() => handleDelete(adm._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Delete"><HiX /></button>
                                                    </>
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

export default ViewAdmissions;
