import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const AddAdmission = () => {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();

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

            toast.success('Admission created successfully! Student account verified/created.');
            reset();
            navigate('/admin/admissions');
        } catch (err) {
            console.error('Submission Error:', err);
            if (err.response) {
                console.error('Error Response Data:', err.response.data);
                console.error('Error Status:', err.response.status);
            }
            toast.error(err.response?.data?.message || 'Submission failed. Check console for details.');
        }
    };

    return (
        <>
            <Helmet>
                <title>Add Admission | Admin Panel</title>
            </Helmet>

            <div className="pt-24 pb-12 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">REGISTRATION FORM</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Pretech Computer Education — New Student Registration</p>
                    </div>

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="card p-6 sm:p-8"
                    >
                        {/* Row 1: Reg No (auto) & Date */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="label text-xs">Reg. No</label>
                                <div className="input-field bg-gray-100 dark:bg-dark-card text-gray-500 text-sm">Auto Generated</div>
                            </div>
                            <div>
                                <label className="label text-xs">Date of Reg.</label>
                                <div className="input-field bg-gray-100 dark:bg-dark-card text-gray-500 text-sm">{new Date().toLocaleDateString('en-IN')}</div>
                            </div>
                        </div>

                        {/* Student's Name + Upload Photo on right */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_130px] gap-4 mb-4">
                            <div>
                                <label className="label text-xs">Student's Name *</label>
                                <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Full Name" />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="hidden md:block row-span-4">
                                <label className="label text-xs text-center">Upload Photo</label>
                                <div className="w-24 h-28 mx-auto border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg flex items-center justify-center mb-2 bg-gray-50 dark:bg-dark-card">
                                    <span className="text-3xl text-gray-300">📷</span>
                                </div>
                                <input type="file" accept="image/*" {...register('passportPhoto')} className="text-[10px] w-full" />
                            </div>
                        </div>

                        {/* Father's Name */}
                        <div className="mb-4 md:pr-[146px]">
                            <label className="label text-xs">Father's Name *</label>
                            <input {...register('fatherHusbandName', { required: 'Required' })} className="input-field" />
                        </div>

                        {/* Mother's Name */}
                        <div className="mb-4 md:pr-[146px]">
                            <label className="label text-xs">Mother's Name *</label>
                            <input {...register('motherName', { required: 'Required' })} className="input-field" />
                        </div>

                        {/* Address */}
                        <div className="mb-4 md:pr-[146px]">
                            <label className="label text-xs">Address *</label>
                            <textarea {...register('address', { required: 'Required' })} className="input-field" rows="2" />
                        </div>

                        {/* Mobile photo upload */}
                        <div className="md:hidden mb-4">
                            <label className="label text-xs">Upload Photo</label>
                            <input type="file" accept="image/*" {...register('passportPhoto')} className="input-field !py-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700" />
                        </div>

                        <hr className="my-5 border-gray-200 dark:border-dark-border" />

                        {/* Reference By */}
                        <div className="mb-4">
                            <label className="label text-xs">Reference By</label>
                            <input {...register('referenceBy')} className="input-field" placeholder="Referred by (optional)" />
                        </div>

                        {/* Mobile No & Qualification */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="label text-xs">Mobile No. *</label>
                                <input {...register('mobile', { required: 'Mobile is required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit mobile' } })} className="input-field" placeholder="10-digit Mobile" />
                                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                            </div>
                            <div>
                                <label className="label text-xs">Qualification</label>
                                <input {...register('qualification')} className="input-field" placeholder="e.g. 12th, Graduate" />
                            </div>
                        </div>

                        <hr className="my-5 border-gray-200 dark:border-dark-border" />

                        {/* Select Course & Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                                <div className="input-field bg-gray-100 dark:bg-dark-card text-gray-500 text-sm">
                                    {courses.find(c => c._id === watch('courseApplied'))?.duration || '—'} Months
                                </div>
                            </div>
                        </div>

                        {/* Batch Month & Batch Timing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="label text-xs">Batch Month</label>
                                <input type="month" {...register('batchMonth')} className="input-field" />
                            </div>
                            <div>
                                <label className="label text-xs">Batch Timing *</label>
                                <select {...register('batchTiming', { required: 'Required' })} className="input-field">
                                    <option value="">Select Batch</option>
                                    <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                                    <option value="Afternoon (12PM-3PM)">Afternoon (12PM-3PM)</option>
                                    <option value="Evening (3PM-6PM)">Evening (3PM-6PM)</option>
                                    <option value="Weekend">Weekend</option>
                                </select>
                                {errors.batchTiming && <p className="text-red-500 text-xs mt-1">{errors.batchTiming.message}</p>}
                            </div>
                        </div>

                        {/* Gender & Aadhar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                                <input {...register('aadharNumber')} className="input-field" placeholder="12-digit Aadhar (optional)" maxLength="12" />
                            </div>
                        </div>

                        {/* DOB & Signature */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="label text-xs">Date of Birth *</label>
                                <input type="date" {...register('dob', { required: 'Required' })} className="input-field" />
                            </div>
                            <div>
                                <label className="label text-xs">Signature</label>
                                <input type="file" accept="image/*" {...register('signature')} className="input-field !py-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700" />
                            </div>
                        </div>

                        <hr className="my-5 border-gray-200 dark:border-dark-border" />

                        {/* Fee Section */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Fee Details</h3>

                        {/* Academic Fee & Discount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="label text-xs">Academic Fee</label>
                                <div className="input-field bg-gray-100 dark:bg-dark-card font-bold text-sm">
                                    ₹{(courses.find(c => c._id === watch('courseApplied'))?.fees || 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div>
                                <label className="label text-xs">Discount Amt. (₹)</label>
                                <input type="number" {...register('discount', { min: 0 })} className="input-field" placeholder="0" min="0" />
                            </div>
                        </div>

                        {/* Fee Summary */}
                        {watch('courseApplied') && (
                            <div className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Course Fees:</span>
                                    <span>₹{courses.find(c => c._id === watch('courseApplied'))?.fees?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount:</span>
                                    <span>- ₹{parseInt(watch('discount') || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-200">
                                    <span>Final Fees:</span>
                                    <span>₹{Math.max(0, (courses.find(c => c._id === watch('courseApplied'))?.fees || 0) - (parseInt(watch('discount') || 0))).toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {/* Mode of Payment */}
                        <div className="space-y-3 mb-4">
                            <label className="label text-xs font-semibold">Mode of Payment</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" value="Full" {...register('paymentPlan')} defaultChecked className="text-primary-600 focus:ring-primary-500" />
                                    <span className="text-gray-900 dark:text-white text-sm">Full Payment</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" value="Installment" {...register('paymentPlan')} className="text-primary-600 focus:ring-primary-500" />
                                    <span className="text-gray-900 dark:text-white text-sm">Installments (Monthly)</span>
                                </label>
                            </div>
                        </div>

                        {/* Installment Dropdown */}
                        {watch('paymentPlan') === 'Installment' && (
                            <div className="mb-4 max-w-xs animate-fadeIn">
                                <label className="label text-xs">Number of Installments</label>
                                <select {...register('totalInstallments', { value: 2 })} className="input-field">
                                    <option value="2">2 Installments</option>
                                    <option value="3">3 Installments</option>
                                    <option value="4">4 Installments</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Approx. ₹{Math.ceil(Math.max(0, (courses.find(c => c._id === watch('courseApplied'))?.fees || 0) - (parseInt(watch('discount') || 0))) / (parseInt(watch('totalInstallments')) || 2)).toLocaleString()} per installment
                                </p>
                            </div>
                        )}

                        {/* Payment Status */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
                            <label className="label text-xs text-blue-800 dark:text-blue-300">Payment Status (Admin Override)</label>
                            <select {...register('paymentStatus')} className="input-field bg-white dark:bg-dark-bg">
                                <option value="Pending">Pending (Student will pay later)</option>
                                <option value="Paid">Paid (Cash/Offline Payment)</option>
                            </select>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Selecting "Paid" will mark the admission as confirmed immediately.
                            </p>
                        </div>

                        {/* Email - optional at bottom */}
                        <div className="mb-6 max-w-md">
                            <label className="label text-xs">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input type="email" {...register('email')} className="input-field" placeholder="Student Email (optional)" />
                            <p className="text-xs text-gray-400 mt-1">If provided, a student login account will be created.</p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-4 border-t pt-6 border-gray-100 dark:border-dark-border">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                className="btn-outline px-6"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary px-8"
                            >
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
