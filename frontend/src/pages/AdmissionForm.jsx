import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api/axios';

const AdmissionForm = () => {
    const [courses, setCourses] = useState([]);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses?status=Active');
                setCourses(data);
            } catch {
                setCourses([
                    { _id: '1', name: 'Full Stack Web Development', fees: 15000 },
                    { _id: '2', name: 'Python Programming', fees: 10000 },
                    { _id: '3', name: 'Data Science & ML', fees: 20000 },
                    { _id: '4', name: 'Tally Prime + GST', fees: 6000 },
                    { _id: '5', name: 'Graphic Design', fees: 8000 },
                    { _id: '6', name: 'Advanced Excel & VBA', fees: 5000 },
                ]);
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

            const res = await API.post('/admissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Admission submitted successfully!');

            // Navigate to payment page with admission data
            navigate('/payment', {
                state: {
                    admission: res.data.admission,
                    admissionId: res.data.admission._id
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        }
    };

    const totalSteps = 3;

    return (
        <>
            <Helmet>
                <title>Admission Form | Pretech Computer Education</title>
            </Helmet>

            <div className="pt-24 pb-12 gradient-bg">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">Admission Form</h1>
                    <p className="text-white/70 text-lg">Complete the form to join Pretech Computer Education</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12 -mt-8">
                {/* Step indicator */}
                <div className="flex items-center justify-center mb-10">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                                    ? 'bg-primary-700 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-dark-card text-gray-500'
                                    }`}
                            >
                                {s}
                            </div>
                            {s < totalSteps && (
                                <div className={`w-16 sm:w-24 h-1 mx-2 rounded transition-all ${step > s ? 'bg-primary-700' : 'bg-gray-200 dark:bg-dark-card'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="card p-8"
                >
                    {/* Step 1: Personal Details */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="label">Full Name *</label>
                                    <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Full Name" />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Father/Husband Name *</label>
                                    <input {...register('fatherHusbandName', { required: 'Required' })} className="input-field" placeholder="Father/Husband Name" />
                                    {errors.fatherHusbandName && <p className="text-red-500 text-xs mt-1">{errors.fatherHusbandName.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Mother Name *</label>
                                    <input {...register('motherName', { required: 'Required' })} className="input-field" placeholder="Mother Name" />
                                    {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Date of Birth *</label>
                                    <input type="date" {...register('dob', { required: 'DOB is required' })} className="input-field" />
                                    {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Gender *</label>
                                    <select {...register('gender', { required: 'Required' })} className="input-field">
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
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
                                    {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus.message}</p>}
                                </div>
                            </div>

                            <button type="button" onClick={() => setStep(2)} className="btn-primary w-full !py-3">
                                Next: Contact Details →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Contact & Education */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">Contact & Education</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="label">Mobile Number *</label>
                                    <input {...register('mobile', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile' } })} className="input-field" placeholder="10-digit mobile" />
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Email *</label>
                                    <input type="email" {...register('email', { required: 'Required' })} className="input-field" placeholder="Email address" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Qualification *</label>
                                    <input {...register('qualification', { required: 'Required' })} className="input-field" placeholder="e.g. B.Tech, 12th Pass" />
                                    {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Occupation</label>
                                    <input {...register('occupation')} className="input-field" placeholder="Current occupation" />
                                </div>
                            </div>

                            <div>
                                <label className="label">Residence Address *</label>
                                <textarea {...register('address', { required: 'Required' })} className="input-field" rows="2" placeholder="Complete address" />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                            </div>

                            <div className="flex space-x-4">
                                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 !py-3">← Back</button>
                                <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 !py-3">Next: Course & Documents →</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Course & Documents */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">Course & Documents</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="label">Course Applied For *</label>
                                    <select {...register('courseApplied', { required: 'Required' })} className="input-field">
                                        <option value="">Select course</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.name} — ₹{c.fees?.toLocaleString('en-IN')}</option>
                                        ))}
                                    </select>
                                    {errors.courseApplied && <p className="text-red-500 text-xs mt-1">{errors.courseApplied.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Batch Timing *</label>
                                    <select {...register('batchTiming', { required: 'Required' })} className="input-field">
                                        <option value="">Select batch</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                    {errors.batchTiming && <p className="text-red-500 text-xs mt-1">{errors.batchTiming.message}</p>}
                                </div>
                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="label">Passport Photo</label>
                                    <input type="file" accept="image/*" {...register('passportPhoto')} className="input-field !py-2 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 file:text-sm file:font-medium" />
                                </div>
                                <div>
                                    <label className="label">Signature</label>
                                    <input type="file" accept="image/*" {...register('signature')} className="input-field !py-2 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 file:text-sm file:font-medium" />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    ⚠️ After submission, you'll be redirected to the payment page. A student account will be auto-created with your email and mobile number as the default password.
                                </p>
                            </div>

                            <div className="flex space-x-4">
                                <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1 !py-3">← Back</button>
                                <button type="submit" disabled={isSubmitting} className="btn-accent flex-1 !py-3 disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit & Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.form>
            </div>
        </>
    );
};

export default AdmissionForm;
