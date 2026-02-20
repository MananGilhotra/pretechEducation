import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiSearch, HiDownload, HiCheck, HiX, HiEye, HiCurrencyRupee, HiUser, HiPhone, HiMail, HiLocationMarker, HiAcademicCap, HiCalendar, HiIdentification } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ViewAdmissions = () => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentFees, setStudentFees] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);

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
            if (selectedStudent?._id === id) setSelectedStudent(null);
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

    const openDetail = async (admission) => {
        setSelectedStudent(admission);
        setLoadingDetail(true);
        try {
            const { data } = await API.get(`/payments/summary/${admission._id}`);
            setStudentFees(data);
        } catch { setStudentFees(null); }
        finally { setLoadingDetail(false); }
    };

    const closeDetail = () => {
        setSelectedStudent(null);
        setStudentFees(null);
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
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => openDetail(adm)}
                                                    className="font-mono text-primary-700 dark:text-primary-400 font-medium text-xs hover:underline cursor-pointer"
                                                >
                                                    {adm.studentId}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{adm.name}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{adm.email}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{adm.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${adm.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : adm.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{adm.paymentStatus}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {adm.approved ? <span className="text-green-600">✓ Yes</span> : <span className="text-gray-400">No</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-1">
                                                    <button onClick={() => openDetail(adm)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="View Details"><HiEye /></button>
                                                    {!adm.approved && (
                                                        <>
                                                            <button onClick={() => handleApprove(adm._id)} className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Approve"><HiCheck /></button>
                                                            <button onClick={() => handleDelete(adm._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Delete"><HiX /></button>
                                                        </>
                                                    )}
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

            {/* ======================== STUDENT DETAIL MODAL ======================== */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeDetail}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {selectedStudent.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                                        <p className="text-sm font-mono text-primary-700 dark:text-primary-400">{selectedStudent.studentId}</p>
                                    </div>
                                </div>
                                <button onClick={closeDetail} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                                    <HiX className="text-xl" />
                                </button>
                            </div>

                            {/* Fee Summary */}
                            {loadingDetail ? (
                                <div className="text-center py-4 text-gray-500">Loading fee details...</div>
                            ) : studentFees?.feeSummary && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3 text-center">
                                        <div className="text-xs text-gray-500 mb-0.5">Total Fees</div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">₹{studentFees.feeSummary.totalFees?.toLocaleString('en-IN')}</div>
                                    </div>
                                    {studentFees.feeSummary.discount > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                                            <div className="text-xs text-amber-600 mb-0.5">Discount</div>
                                            <div className="text-lg font-bold text-amber-700">₹{studentFees.feeSummary.discount?.toLocaleString('en-IN')}</div>
                                        </div>
                                    )}
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                                        <div className="text-xs text-green-600 mb-0.5">Amount Paid</div>
                                        <div className="text-lg font-bold text-green-600">₹{studentFees.feeSummary.totalPaid?.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className={`rounded-xl p-3 text-center ${studentFees.feeSummary.balanceDue === 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <div className={`text-xs mb-0.5 ${studentFees.feeSummary.balanceDue === 0 ? 'text-green-600' : 'text-red-600'}`}>Balance</div>
                                        <div className={`text-lg font-bold ${studentFees.feeSummary.balanceDue === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {studentFees.feeSummary.balanceDue === 0 ? '✓ Cleared' : `₹${studentFees.feeSummary.balanceDue?.toLocaleString('en-IN')}`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Personal Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><HiUser className="text-primary-600" /> Personal Information</h3>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Father/Husband', value: selectedStudent.fatherHusbandName },
                                            { label: 'Mother', value: selectedStudent.motherName },
                                            { label: 'DOB', value: selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '' },
                                            { label: 'Gender', value: selectedStudent.gender },
                                            { label: 'Marital Status', value: selectedStudent.maritalStatus },
                                            { label: 'Qualification', value: selectedStudent.qualification },
                                            { label: 'Occupation', value: selectedStudent.occupation },
                                        ].filter(r => r.value).map((row, i) => (
                                            <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                                                <span className="text-xs text-gray-500">{row.label}</span>
                                                <span className="text-xs font-medium text-gray-900 dark:text-white text-right">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><HiPhone className="text-primary-600" /> Contact & Course</h3>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Mobile', value: selectedStudent.mobile },
                                            { label: 'Email', value: selectedStudent.email },
                                            { label: 'Address', value: selectedStudent.address },
                                            { label: 'Aadhar', value: selectedStudent.aadharNumber },
                                            { label: 'Course', value: selectedStudent.courseApplied?.name },
                                            { label: 'Batch Timing', value: selectedStudent.batchTiming },
                                            { label: 'Batch Month', value: selectedStudent.batchMonth },
                                            { label: 'Payment Plan', value: selectedStudent.paymentPlan },
                                            { label: 'Reference By', value: selectedStudent.referenceBy },
                                            { label: 'Registered', value: selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '' },
                                        ].filter(r => r.value).map((row, i) => (
                                            <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-dark-border last:border-0">
                                                <span className="text-xs text-gray-500">{row.label}</span>
                                                <span className="text-xs font-medium text-gray-900 dark:text-white text-right max-w-[60%] break-words">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payment History */}
                            {studentFees?.payments?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><HiCurrencyRupee className="text-green-600" /> Payment History ({studentFees.payments.length})</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-dark-border">
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-500">#</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Amount</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Method</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Date</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentFees.payments.map((pay, i) => (
                                                    <tr key={pay._id} className="border-b border-gray-100 dark:border-dark-border">
                                                        <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                                                        <td className="py-2 px-3 font-semibold text-green-600">₹{pay.amount?.toLocaleString('en-IN')}</td>
                                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{pay.paymentMethod}</td>
                                                        <td className="py-2 px-3 text-gray-500">{new Date(pay.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td className="py-2 px-3">
                                                            <a href={`/api/payments/${pay._id}/receipt`} target="_blank" rel="noopener noreferrer"
                                                                className="text-primary-700 dark:text-primary-400 hover:underline">Download</a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Passport Photo & Signature */}
                            {(selectedStudent.passportPhoto || selectedStudent.signature) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Documents</h3>
                                    <div className="flex gap-4 flex-wrap">
                                        {selectedStudent.passportPhoto && (
                                            <div className="text-center">
                                                <img
                                                    src={selectedStudent.passportPhoto}
                                                    alt="Passport Photo"
                                                    className="w-24 h-28 object-cover rounded-xl border border-gray-200 dark:border-dark-border cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                                                    onClick={() => setViewingImage(selectedStudent.passportPhoto)}
                                                />
                                                <button
                                                    onClick={() => setViewingImage(selectedStudent.passportPhoto)}
                                                    className="mt-1.5 text-xs text-primary-700 dark:text-primary-400 hover:underline"
                                                >View Photo</button>
                                            </div>
                                        )}
                                        {selectedStudent.signature && (
                                            <div className="text-center">
                                                <img
                                                    src={selectedStudent.signature}
                                                    alt="Signature"
                                                    className="w-32 h-16 object-contain rounded-xl border border-gray-200 dark:border-dark-border bg-white cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                                                    onClick={() => setViewingImage(selectedStudent.signature)}
                                                />
                                                <button
                                                    onClick={() => setViewingImage(selectedStudent.signature)}
                                                    className="mt-1.5 text-xs text-primary-700 dark:text-primary-400 hover:underline"
                                                >View Signature</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* ======================== IMAGE LIGHTBOX ======================== */}
            {viewingImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setViewingImage(null)}>
                    <div className="relative max-w-2xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingImage(null)}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-dark-card rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-red-500 transition-colors z-10"
                        ><HiX /></button>
                        <img src={viewingImage} alt="Full view" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain bg-white" />
                    </div>
                </div>
            )}
        </>
    );
};

export default ViewAdmissions;
