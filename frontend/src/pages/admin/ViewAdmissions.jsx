import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiSearch, HiDownload, HiCheck, HiX, HiEye, HiCurrencyRupee, HiUser, HiPhone, HiMail, HiLocationMarker, HiAcademicCap, HiCalendar, HiIdentification } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const ViewAdmissions = () => {
    const navigate = useNavigate();
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentFees, setStudentFees] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [editFiles, setEditFiles] = useState({ passportPhoto: null, signature: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

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

    const handleDelete = async () => {
        try {
            await API.delete(`/admissions/${deleteModal.id}`);
            toast.success('Admission deleted');
            fetchAdmissions();
            if (selectedStudent?._id === deleteModal.id) setSelectedStudent(null);
            setDeleteModal({ isOpen: false, id: null });
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
        setEditData({
            name: admission.name || '',
            fatherHusbandName: admission.fatherHusbandName || '',
            motherName: admission.motherName || '',
            dob: admission.dob ? new Date(admission.dob).toISOString().split('T')[0] : '',
            gender: admission.gender || '',
            maritalStatus: admission.maritalStatus || 'Single',
            qualification: admission.qualification || '',
            occupation: admission.occupation || '',
            mobile: admission.mobile || '',
            email: admission.email || '',
            address: admission.address || '',
            aadharNumber: admission.aadharNumber || '',
            registrationDate: admission.registrationDate ? new Date(admission.registrationDate).toISOString().split('T')[0] : ''
        });
        setEditFiles({ passportPhoto: null, signature: null });
        setIsEditing(false);
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
        setIsEditing(false);
        setEditFiles({ passportPhoto: null, signature: null });
    };

    const handleSaveEdit = async () => {
        try {
            const formData = new FormData();
            Object.keys(editData).forEach(key => {
                if (editData[key] !== null && editData[key] !== undefined) {
                    formData.append(key, editData[key]);
                }
            });
            if (editFiles.passportPhoto) {
                formData.append('passportPhoto', editFiles.passportPhoto);
            }
            if (editFiles.signature) {
                formData.append('signature', editFiles.signature);
            }

            const { data } = await API.put(`/admissions/${selectedStudent._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Student details updated');
            setSelectedStudent(data.admission);
            setIsEditing(false);
            fetchAdmissions(); // Refresh list background
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
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
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search by name, ID, or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field !pl-11" />
                        </div>
                        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field !w-auto">
                            <option value="">All Courses</option>
                            {[...new Set(admissions.map(a => a.courseApplied?.name).filter(Boolean))].sort().map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field !w-auto">
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    {/* Summary Counts */}
                    {(() => {
                        const filtered = admissions.filter(a => !courseFilter || a.courseApplied?.name === courseFilter);
                        const paidCount = filtered.filter(a => a.paymentStatus === 'Paid').length;
                        const pendingCount = filtered.filter(a => a.paymentStatus === 'Pending').length;
                        const partialCount = filtered.filter(a => a.paymentStatus === 'Partially Paid').length;
                        return (
                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                                    <span className="text-xs text-gray-500">Total Students:</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{filtered.length}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <span className="text-xs text-green-600">Paid:</span>
                                    <span className="text-sm font-bold text-green-700 dark:text-green-400">{paidCount}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <span className="text-xs text-amber-600">Pending:</span>
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{pendingCount}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                    <span className="text-xs text-orange-600">Partially Paid:</span>
                                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{partialCount}</span>
                                </div>
                            </div>
                        );
                    })()}

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
                                    {admissions.filter(a => !courseFilter || a.courseApplied?.name === courseFilter).length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No admissions found</td></tr>
                                    ) : admissions.filter(a => !courseFilter || a.courseApplied?.name === courseFilter).map((adm) => (
                                        <tr key={adm._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => openDetail(adm)}
                                                    className="font-mono text-primary-700 dark:text-primary-400 font-medium text-xs hover:underline cursor-pointer"
                                                >
                                                    {adm.studentId}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-gray-900 dark:text-white font-medium">{adm.name}</div>
                                                {adm.fatherHusbandName && <div className="text-xs text-gray-500 font-normal mt-0.5">S/D of {adm.fatherHusbandName}</div>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{adm.email}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{adm.courseApplied?.name || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${adm.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : adm.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : adm.paymentStatus === 'Partially Paid' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>{adm.paymentStatus}</span>
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
                                                            <button onClick={() => setDeleteModal({ isOpen: true, id: adm._id })} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Delete"><HiX /></button>
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
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
                                        {selectedStudent.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        {isEditing ? (
                                            <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="input-field py-1 text-lg font-bold mb-1" placeholder="Student Name" />
                                        ) : (
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                                        )}
                                        <p className="text-sm font-mono text-primary-700 dark:text-primary-400">{selectedStudent.studentId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => setIsEditing(false)} className="btn-outline px-3 py-1.5 text-xs">Cancel</button>
                                            <button onClick={handleSaveEdit} className="btn-primary px-4 py-1.5 text-xs">Save</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => {
                                                navigate('/admin/add-admission', {
                                                    state: {
                                                        reAdmit: true,
                                                        studentData: {
                                                            name: selectedStudent.name,
                                                            fatherHusbandName: selectedStudent.fatherHusbandName,
                                                            motherName: selectedStudent.motherName,
                                                            dob: selectedStudent.dob ? new Date(selectedStudent.dob).toISOString().split('T')[0] : '',
                                                            gender: selectedStudent.gender,
                                                            maritalStatus: selectedStudent.maritalStatus,
                                                            qualification: selectedStudent.qualification,
                                                            occupation: selectedStudent.occupation,
                                                            mobile: selectedStudent.mobile,
                                                            email: selectedStudent.email,
                                                            address: selectedStudent.address,
                                                            aadharNumber: selectedStudent.aadharNumber,
                                                            referenceBy: selectedStudent.referenceBy,
                                                            existingPhoto: selectedStudent.passportPhoto,
                                                            existingSignature: selectedStudent.signature,
                                                        }
                                                    }
                                                });
                                            }} className="btn-primary px-3 py-1.5 text-xs">🔄 Re-Admit</button>
                                            <button onClick={() => setIsEditing(true)} className="btn-outline px-3 py-1.5 text-xs">✏️ Edit</button>
                                        </>
                                    )}
                                    <button onClick={closeDetail} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                                        <HiX className="text-xl" />
                                    </button>
                                </div>
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
                                            { label: 'Father/Husband', key: 'fatherHusbandName', value: selectedStudent.fatherHusbandName },
                                            { label: 'Mother', key: 'motherName', value: selectedStudent.motherName },
                                            { label: 'DOB', key: 'dob', type: 'date', value: selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '' },
                                            { label: 'Gender', key: 'gender', type: 'select', options: ['Male', 'Female', 'Other'], value: selectedStudent.gender },
                                            { label: 'Marital Status', key: 'maritalStatus', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'], value: selectedStudent.maritalStatus },
                                            { label: 'Qualification', key: 'qualification', value: selectedStudent.qualification },
                                            { label: 'Occupation', key: 'occupation', value: selectedStudent.occupation },
                                        ].filter(r => isEditing || r.value).map((row, i) => (
                                            <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-dark-border last:border-0">
                                                <span className="text-xs text-gray-500 w-1/3">{row.label}</span>
                                                <div className="w-2/3 text-right">
                                                    {isEditing ? (
                                                        row.type === 'select' ? (
                                                            <select value={editData[row.key]} onChange={e => setEditData({ ...editData, [row.key]: e.target.value })} className="input-field py-1 text-xs px-2 h-auto text-right">
                                                                {row.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input type={row.type || 'text'} value={editData[row.key] || ''} onChange={e => setEditData({ ...editData, [row.key]: e.target.value })} className="input-field py-1 text-xs px-2 h-auto text-right" />
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-900 dark:text-white">{row.value}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><HiPhone className="text-primary-600" /> Contact & Course</h3>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Mobile', key: 'mobile', value: selectedStudent.mobile, edit: true },
                                            { label: 'Email', key: 'email', value: selectedStudent.email, edit: true, type: 'email' },
                                            { label: 'Address', key: 'address', value: selectedStudent.address, edit: true },
                                            { label: 'Aadhar', key: 'aadharNumber', value: selectedStudent.aadharNumber, edit: true },
                                            { label: 'Course', key: 'courseApplied', value: selectedStudent.courseApplied?.name, edit: false },
                                            { label: 'Batch Timing', key: 'batchTiming', value: selectedStudent.batchTiming, edit: false },
                                            { label: 'Batch Month', key: 'batchMonth', value: selectedStudent.batchMonth, edit: false },
                                            { label: 'Payment Plan', key: 'paymentPlan', value: selectedStudent.paymentPlan, edit: false },
                                            { label: 'Reference By', key: 'referenceBy', value: selectedStudent.referenceBy, edit: false },
                                            { label: 'Registered', key: 'registrationDate', value: selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '', edit: true, type: 'date' },
                                        ].filter(r => (isEditing && r.edit) || !isEditing && r.value).map((row, i) => (
                                            <div key={i} className="flex justify-between py-1 border-b border-gray-100 dark:border-dark-border last:border-0" style={{ alignItems: isEditing && row.edit ? 'center' : 'flex-start' }}>
                                                <span className="text-xs text-gray-500 w-1/3 pt-0.5">{row.label}</span>
                                                <div className="w-2/3 text-right">
                                                    {isEditing && row.edit ? (
                                                        <input type={row.type || 'text'} value={editData[row.key] || ''} onChange={e => setEditData({ ...editData, [row.key]: e.target.value })} className="input-field py-1 text-xs px-2 h-auto text-right" />
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-900 dark:text-white break-words inline-block max-w-full text-right">{row.value}</span>
                                                    )}
                                                </div>
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
                            {(isEditing || selectedStudent.passportPhoto || selectedStudent.signature) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Documents</h3>
                                    <div className="flex gap-4 flex-wrap">
                                        {(isEditing || selectedStudent.passportPhoto) && (
                                            <div className="text-center">
                                                {isEditing ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        {editFiles.passportPhoto ? (
                                                            <img src={URL.createObjectURL(editFiles.passportPhoto)} alt="New Photo" className="w-24 h-28 object-cover rounded-xl border border-primary-500" />
                                                        ) : selectedStudent.passportPhoto ? (
                                                            <img src={selectedStudent.passportPhoto} alt="Passport Photo" className="w-24 h-28 object-cover rounded-xl border border-gray-200 dark:border-dark-border opacity-50" />
                                                        ) : (
                                                            <div className="w-24 h-28 bg-gray-100 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border flex items-center justify-center text-xs text-gray-500">No Photo</div>
                                                        )}
                                                        <input type="file" accept="image/*" onChange={e => setEditFiles({ ...editFiles, passportPhoto: e.target.files[0] })} className="text-[10px] w-32" />
                                                    </div>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {(isEditing || selectedStudent.signature) && (
                                            <div className="text-center">
                                                {isEditing ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        {editFiles.signature ? (
                                                            <img src={URL.createObjectURL(editFiles.signature)} alt="New Signature" className="w-32 h-16 object-contain rounded-xl border border-primary-500 bg-white" />
                                                        ) : selectedStudent.signature ? (
                                                            <img src={selectedStudent.signature} alt="Signature" className="w-32 h-16 object-contain rounded-xl border border-gray-200 dark:border-dark-border bg-white opacity-50" />
                                                        ) : (
                                                            <div className="w-32 h-16 bg-white rounded-xl border border-gray-200 dark:border-dark-border flex items-center justify-center text-xs text-gray-500">No Signature</div>
                                                        )}
                                                        <input type="file" accept="image/*" onChange={e => setEditFiles({ ...editFiles, signature: e.target.files[0] })} className="text-[10px] w-32" />
                                                    </div>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Admission"
                message="Are you sure you want to delete this admission? This action cannot be undone and will remove all associated payment records."
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                confirmText="Delete Admission"
                confirmColor="red"
            />

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
