import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const AddTeacher = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    const onSubmit = async (data) => {
        try {
            await API.post('/teachers', data);
            toast.success('Teacher added successfully!');
            navigate('/admin/teachers');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add teacher');
        }
    };

    return (
        <>
            <Helmet><title>Add Teacher | Admin Panel</title></Helmet>
            <div className="pt-24 pb-12 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">ADD TEACHER</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pretech Computer Education — New Teacher Registration</p>
                    </div>

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="card p-5 sm:p-6"
                    >
                        {/* Row 1: Name, Phone, Subject */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-4">
                            <div>
                                <label className="label text-xs">Teacher Name *</label>
                                <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Full Name" />
                                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="label text-xs">Phone Number *</label>
                                <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit phone' } })} className="input-field" placeholder="10-digit Phone" />
                                {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label className="label text-xs">Subject / Specialization *</label>
                                <input {...register('subject', { required: 'Subject is required' })} className="input-field" placeholder="e.g. Tally, Web Development" />
                                {errors.subject && <p className="text-red-500 text-xs mt-0.5">{errors.subject.message}</p>}
                            </div>
                        </div>

                        {/* Row 2: Qualification, Address, Aadhar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-4">
                            <div>
                                <label className="label text-xs">Qualification</label>
                                <input {...register('qualification')} className="input-field" placeholder="e.g. B.Tech, MCA" />
                            </div>
                            <div>
                                <label className="label text-xs">Address</label>
                                <input {...register('address')} className="input-field" placeholder="Address" />
                            </div>
                            <div>
                                <label className="label text-xs">Aadhar Number</label>
                                <input {...register('aadharNumber')} className="input-field" placeholder="12-digit (optional)" maxLength="12" />
                            </div>
                        </div>

                        <hr className="my-4 border-gray-200 dark:border-dark-border" />

                        {/* Row 3: Salary, Joining Date, Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-4">
                            <div>
                                <label className="label text-xs">Monthly Salary (₹) *</label>
                                <input type="number" {...register('monthlySalary', { required: 'Salary is required', min: { value: 1, message: 'Must be > 0' } })} className="input-field" placeholder="e.g. 15000" />
                                {errors.monthlySalary && <p className="text-red-500 text-xs mt-0.5">{errors.monthlySalary.message}</p>}
                            </div>
                            <div>
                                <label className="label text-xs">Joining Date</label>
                                <input type="date" {...register('joiningDate')} defaultValue={new Date().toISOString().split('T')[0]} className="input-field" />
                            </div>
                            <div>
                                <label className="label text-xs">Status</label>
                                <select {...register('status')} className="input-field">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                        </div>

                        <hr className="my-4 border-gray-200 dark:border-dark-border" />

                        {/* Row 4: Email + Password (for teacher login) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 mb-4">
                            <div>
                                <label className="label text-xs">Email <span className="text-gray-400 font-normal">(for login, optional)</span></label>
                                <input type="email" {...register('email')} className="input-field" placeholder="teacher@email.com" />
                            </div>
                            {watch('email') && (
                                <div>
                                    <label className="label text-xs text-green-700 dark:text-green-400">Login Password *</label>
                                    <input type="text" {...register('teacherPassword', { required: watch('email') ? 'Password required' : false, minLength: { value: 6, message: 'Min 6 characters' } })} className="input-field" placeholder="Set password for teacher" />
                                    {errors.teacherPassword && <p className="text-red-500 text-xs mt-0.5">{errors.teacherPassword.message}</p>}
                                </div>
                            )}
                        </div>

                        {watch('email') && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                                <p className="text-xs text-green-600 dark:text-green-400">🔑 Teacher can log in with email and password to view their salary history.</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 border-t pt-5 mt-3 border-gray-100 dark:border-dark-border">
                            <button type="button" onClick={() => navigate('/admin/teachers')} className="btn-outline px-5">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary px-7">
                                {isSubmitting ? 'Adding...' : 'Add Teacher'}
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </>
    );
};

export default AddTeacher;
