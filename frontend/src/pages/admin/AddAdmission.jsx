import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const AddAdmission = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const reAdmitData = location.state?.reAdmit ? location.state.studentData : null;
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();

    // Pre-fill form when re-admitting
    useEffect(() => {
        if (reAdmitData) {
            reset({
                ...reAdmitData,
                registrationDate: new Date().toISOString().split('T')[0],
                paymentPlan: 'Full',
                paymentStatus: 'Pending',
            });
        }
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses?status=Active');
                setCourses(data);
            } catch {
                setCourses([]);
            }
        };
        fetchCourses();
    }, []);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'passportPhoto' || key === 'signature') {
                    if (data[key]?.[0]) formData.append(key, data[key][0]);
                } else {
                    formData.append(key, data[key]);
                }
            });

            await API.post('/admissions/admin', formData);
            toast.success('Admission created successfully!');
            reset();
            navigate('/admin/admissions');
        } catch (err) {
            console.error('Submission Error:', err);
            toast.error(err.response?.data?.message || 'Submission failed.');
        }
    };

    return (
        <>
            <Helmet>
                <title>Add Admission | Admin Panel</title>
            </Helmet>

            <div className="pt-24 pb-12 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{reAdmitData ? 'RE-ADMISSION FORM' : 'REGISTRATION FORM'}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pretech Computer Education — {reAdmitData ? 'Re-Admission' : 'New Student Registration'}</p>
                    </div>

                    {reAdmitData && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                🔄 <strong>Re-Admission</strong> — Student details for <strong>{reAdmitData.name}</strong> have been pre-filled. Please select the new course and update fee details.
                            </p>
                        </div>
                    )}

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="card p-5 sm:p-6"
                    >
                        {/* ===== 3 COLUMN GRID ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">

                            {/* --- Column 1 Row 1: Reg No --- */}
                            <div>
                                <label className="label text-xs">Reg. No</label>
                                <div className="input-field bg-gray-100 dark:bg-dark-card text-gray-500 text-sm py-2">Auto Generated</div>
                            </div>
                            {/* --- Column 2 Row 1: Date --- */}
                            <div>
                                <label className="label text-xs">Date of Reg.</label>
                                <input type="date" {...register('registrationDate')} defaultValue={new Date().toISOString().split('T')[0]} className="input-field" />
                            </div>
                            {/* --- Column 3 Row 1: Photo Upload --- */}
                            <div className="sm:row-span-4 flex flex-col items-center justify-start">
                                <label className="label text-xs text-center mb-1">Upload Photo *</label>
                                <div className={`w-24 h-28 border-2 border-dashed ${errors.passportPhoto ? 'border-red-400' : 'border-gray-300 dark:border-dark-border'} rounded-lg flex items-center justify-center bg-gray-50 dark:bg-dark-card mb-1`}>
                                    <span className="text-3xl text-gray-300">📷</span>
                                </div>
                                <input type="file" accept="image/*" {...register('passportPhoto', { required: 'Photo is required' })} className="text-[10px] w-28" />
                                {errors.passportPhoto && <p className="text-red-500 text-[10px] mt-0.5 text-center">{errors.passportPhoto.message}</p>}

                                <label className="label text-xs text-center mb-1 mt-3">Signature</label>
                                <div className="w-28 h-14 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg flex items-center justify-center bg-gray-50 dark:bg-dark-card mb-1">
                                    <span className="text-sm text-gray-300">✍️</span>
                                </div>
                                <input type="file" accept="image/*" {...register('signature')} className="text-[10px] w-28" />
                            </div>

                            {/* --- Student's Name (spans 2 cols) --- */}
                            <div className="sm:col-span-2">
                                <label className="label text-xs">Student's Name *</label>
                                <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Full Name" />
                                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
                            </div>

                            {/* --- Father's Name (spans 2 cols) --- */}
                            <div className="sm:col-span-2">
                                <label className="label text-xs">Father's Name *</label>
                                <input {...register('fatherHusbandName', { required: 'Required' })} className="input-field" />
                            </div>

                            {/* --- Mother's Name (spans 2 cols) --- */}
                            <div className="sm:col-span-2">
                                <label className="label text-xs">Mother's Name *</label>
                                <input {...register('motherName', { required: 'Required' })} className="input-field" />
                            </div>

                            {/* --- Address (full width) --- */}
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="label text-xs">Address *</label>
                                <textarea {...register('address', { required: 'Required' })} className="input-field" rows="2" />
                            </div>
                        </div>

                        <hr className="my-4 border-gray-200 dark:border-dark-border" />

                        {/* ===== ROW: Reference, Mobile, Qualification ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-3">
                            <div>
                                <label className="label text-xs">Reference By</label>
                                <input {...register('referenceBy')} className="input-field" placeholder="Optional" />
                            </div>
                            <div>
                                <label className="label text-xs">Mobile No. *</label>
                                <input {...register('mobile', { required: 'Mobile is required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit mobile' } })} className="input-field" placeholder="10-digit Mobile" />
                                {errors.mobile && <p className="text-red-500 text-xs mt-0.5">{errors.mobile.message}</p>}
                            </div>
                            <div>
                                <label className="label text-xs">Qualification</label>
                                <input {...register('qualification')} className="input-field" placeholder="e.g. 12th, Graduate" />
                            </div>
                        </div>

                        <hr className="my-4 border-gray-200 dark:border-dark-border" />

                        {/* ===== ROW: Course, Duration, Batch Timing ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-3">
                            <div>
                                <label className="label text-xs">Select Course *</label>
                                <select {...register('courseApplied', { required: 'Required' })} className="input-field">
                                    <option value="">Select Course</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} (₹{c.fees?.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label text-xs">Duration</label>
                                <div className="input-field bg-gray-100 dark:bg-dark-card text-gray-500 text-sm py-2">
                                    {courses.find(c => c._id === watch('courseApplied'))?.duration || '—'} Months
                                </div>
                            </div>
                            <div>
                                <label className="label text-xs">Batch Timing *</label>
                                <select {...register('batchTiming', { required: 'Required' })} className="input-field">
                                    <option value="">Select Batch</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                </select>
                                {errors.batchTiming && <p className="text-red-500 text-xs mt-0.5">{errors.batchTiming.message}</p>}
                            </div>
                        </div>

                        {/* ===== ROW: Batch Month, Gender, Aadhar ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-3">
                            <div>
                                <label className="label text-xs">Batch Month</label>
                                <input type="month" {...register('batchMonth')} className="input-field" />
                            </div>
                            <div>
                                <label className="label text-xs">Select Gender *</label>
                                <select {...register('gender', { required: 'Required' })} className="input-field">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label text-xs">Aadhar Number</label>
                                <input {...register('aadharNumber')} className="input-field" placeholder="12-digit (optional)" maxLength="12" />
                            </div>
                        </div>

                        {/* ===== ROW: DOB, Email, Occupation ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
                            <div>
                                <label className="label text-xs">Date of Birth *</label>
                                <input type="date" {...register('dob', { required: 'Required' })} className="input-field" />
                            </div>
                            <div>
                                <label className="label text-xs">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input type="email" {...register('email')} className="input-field" placeholder="Student Email" />
                            </div>
                            <div>
                                <label className="label text-xs">Occupation</label>
                                <input {...register('occupation')} className="input-field" placeholder="Optional" />
                            </div>
                        </div>

                        {/* Student Login Password - only shows when email is entered */}
                        {watch('email') && (
                            <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">🔑 Student Login Credentials</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label text-xs text-green-700 dark:text-green-400">Student Login Email</label>
                                        <div className="input-field bg-white dark:bg-dark-bg text-sm py-2">{watch('email')}</div>
                                    </div>
                                    <div>
                                        <label className="label text-xs text-green-700 dark:text-green-400">Student Login Password *</label>
                                        <input type="text" {...register('studentPassword', { required: watch('email') ? 'Password required when email is provided' : false, minLength: { value: 6, message: 'Min 6 characters' } })} className="input-field bg-white dark:bg-dark-bg" placeholder="Set password for student" />
                                        {errors.studentPassword && <p className="text-red-500 text-xs mt-0.5">{errors.studentPassword.message}</p>}
                                    </div>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">📋 Give these credentials to the student for login. Student ID will be auto-generated.</p>
                            </div>
                        )}

                        <hr className="my-4 border-gray-200 dark:border-dark-border" />

                        {/* ===== FEE SECTION (3 cols) ===== */}
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Fee Details</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-3">
                            <div>
                                <label className="label text-xs">Academic Fee</label>
                                <div className="input-field bg-gray-100 dark:bg-dark-card font-bold text-sm py-2">
                                    ₹{(courses.find(c => c._id === watch('courseApplied'))?.fees || 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div>
                                <label className="label text-xs">Discount Amt. (₹)</label>
                                <input type="number" {...register('discount', { min: 0 })} className="input-field" placeholder="0" min="0" />
                            </div>
                            <div>
                                <label className="label text-xs">Final Fees</label>
                                <div className="input-field bg-green-50 dark:bg-green-900/20 font-bold text-green-700 dark:text-green-400 text-sm py-2">
                                    ₹{Math.max(0, (courses.find(c => c._id === watch('courseApplied'))?.fees || 0) - (parseInt(watch('discount') || 0))).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Mode of Payment + Installments + Payment Status in 3 cols */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-3">
                            <div>
                                <label className="label text-xs font-semibold">Mode of Payment</label>
                                <div className="flex space-x-3 mt-1">
                                    <label className="flex items-center space-x-1.5 cursor-pointer">
                                        <input type="radio" value="Full" {...register('paymentPlan')} defaultChecked className="text-primary-600 focus:ring-primary-500" />
                                        <span className="text-sm text-gray-900 dark:text-white">Full</span>
                                    </label>
                                    <label className="flex items-center space-x-1.5 cursor-pointer">
                                        <input type="radio" value="Installment" {...register('paymentPlan')} className="text-primary-600 focus:ring-primary-500" />
                                        <span className="text-sm text-gray-900 dark:text-white">Monthly</span>
                                    </label>
                                </div>
                            </div>

                            {watch('paymentPlan') === 'Installment' && (
                                <div>
                                    <label className="label text-xs">No. of Installments</label>
                                    <select {...register('totalInstallments', { value: 2 })} className="input-field">
                                        <option value="2">2 Installments</option>
                                        <option value="3">3 Installments</option>
                                        <option value="4">4 Installments</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        ~₹{Math.ceil(Math.max(0, (courses.find(c => c._id === watch('courseApplied'))?.fees || 0) - (parseInt(watch('discount') || 0))) / (parseInt(watch('totalInstallments')) || 2)).toLocaleString()}/inst
                                    </p>
                                </div>
                            )}

                            <div className={watch('paymentPlan') !== 'Installment' ? 'sm:col-span-2' : ''}>
                                <label className="label text-xs text-blue-700 dark:text-blue-300">Payment Status</label>
                                <select {...register('paymentStatus')} className="input-field border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid (Cash/Offline)</option>
                                </select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 border-t pt-5 mt-3 border-gray-100 dark:border-dark-border">
                            <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-outline px-5">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary px-7">
                                {isSubmitting ? 'Creating...' : 'Create Admission'}
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </>
    );
};

export default AddAdmission;
