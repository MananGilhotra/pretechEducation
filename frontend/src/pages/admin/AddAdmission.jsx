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

            // Admin can set payment status directly
            // If the backend accepts it in body (which it does via ...req.body), this will work
            // If not, we might need a separate update call, but let's try this first as per analysis

            await API.post('/admissions/admin', formData);

            toast.success('Admission created successfully! Student account verified/created.');
            reset();
            navigate('/admin/admissions');
        } catch (err) {
            console.error('Submission Error:', err);
            if (err.response) {
                console.error('Error Response Data:', err.response.data);
                console.error('Error Status:', err.response.status);
            } else if (err.request) {
                console.error('No response received:', err.request);
            } else {
                console.error('Error Message:', err.message);
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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">New Admission</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manually enter student details and admission info</p>
                    </div>

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="card p-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2">Student Details</h3>

                                <div>
                                    <label className="label">Full Name *</label>
                                    <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Student Name" />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Email *</label>
                                    <input type="email" {...register('email', { required: 'Email is required' })} className="input-field" placeholder="Student Email" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Mobile *</label>
                                    <input {...register('mobile', { required: 'Mobile is required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile' } })} className="input-field" placeholder="10-digit Mobile" />
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Father/Husband Name *</label>
                                    <input {...register('fatherHusbandName', { required: 'Required' })} className="input-field" />
                                </div>
                                <div>
                                    <label className="label">Mother Name *</label>
                                    <input {...register('motherName', { required: 'Required' })} className="input-field" />
                                </div>
                                <div>
                                    <label className="label">Date of Birth *</label>
                                    <input type="date" {...register('dob', { required: 'Required' })} className="input-field" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Gender *</label>
                                        <select {...register('gender', { required: 'Required' })} className="input-field">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Marital Status *</label>
                                        <select {...register('maritalStatus', { required: 'Required' })} className="input-field">
                                            <option value="">Select</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2">Course & Office Use</h3>

                                <div>
                                    <label className="label">Address *</label>
                                    <textarea {...register('address', { required: 'Required' })} className="input-field" rows="3" />
                                </div>
                                <div>
                                    <label className="label">Qualification *</label>
                                    <input {...register('qualification', { required: 'Required' })} className="input-field" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Photo</label>
                                        <input type="file" accept="image/*" {...register('passportPhoto')} className="input-field !py-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700" />
                                    </div>
                                    <div>
                                        <label className="label">Signature</label>
                                        <input type="file" accept="image/*" {...register('signature')} className="input-field !py-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Course *</label>
                                    <select {...register('courseApplied', { required: 'Required' })} className="input-field">
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Batch Timing *</label>
                                    <select {...register('batchTiming', { required: 'Required' })} className="input-field">
                                        <option value="">Select Batch</option>
                                        <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                                        <option value="Afternoon (12PM-3PM)">Afternoon (12PM-3PM)</option>
                                        <option value="Evening (3PM-6PM)">Evening (3PM-6PM)</option>
                                        <option value="Weekend">Weekend</option>
                                    </select>
                                    {errors.batchTiming && <p className="text-red-500 text-xs mt-1">{errors.batchTiming.message}</p>}
                                </div>

                                <div>
                                    <label className="label">Discount (₹)</label>
                                    <input
                                        type="number"
                                        {...register('discount', { min: 0 })}
                                        className="input-field"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* Fee Summary */}
                                {watch('courseApplied') && (
                                    <div className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
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

                                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-dark-border">
                                    <label className="label font-semibold">Payment Plan</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" value="Full" {...register('paymentPlan')} defaultChecked className="text-primary-600 focus:ring-primary-500" />
                                            <span className="text-gray-900 dark:text-white">Full Payment</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" value="Installment" {...register('paymentPlan')} className="text-primary-600 focus:ring-primary-500" />
                                            <span className="text-gray-900 dark:text-white">Installments</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Conditional Installment Dropdown */}
                                {watch('paymentPlan') === 'Installment' && (
                                    <div className="space-y-2 animate-fadeIn pt-2">
                                        <label className="label">Number of Installments</label>
                                        <select {...register('totalInstallments', { value: 2 })} className="input-field">
                                            <option value="2">2 Installments</option>
                                            <option value="3">3 Installments</option>
                                            <option value="4">4 Installments</option>
                                        </select>
                                        <p className="text-xs text-gray-500">
                                            Approx. ₹{Math.ceil(Math.max(0, (courses.find(c => c._id === watch('courseApplied'))?.fees || 0) - (parseInt(watch('discount') || 0))) / (parseInt(watch('totalInstallments')) || 2)).toLocaleString()} per installment
                                        </p>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <label className="label text-blue-800 dark:text-blue-300">Payment Status (Admin Override)</label>
                                    <select {...register('paymentStatus')} className="input-field bg-white dark:bg-dark-bg">
                                        <option value="Pending">Pending (Student will pay later)</option>
                                        <option value="Paid">Paid (Cash/Offline Payment)</option>
                                    </select>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                        Selecting "Paid" will mark the admission as confirmed immediately.
                                    </p>
                                </div>
                            </div>
                        </div>

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
                </div >
            </div >
        </>
    );
};

export default AddAdmission;
