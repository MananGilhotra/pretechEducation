import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCheckCircle } from 'react-icons/hi';
import API from '../api/axios';

const EnquiryForm = () => {
    const [submitted, setSubmitted] = useState(false);
    const [courses, setCourses] = useState([]);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses?status=Active');
                setCourses(data);
            } catch {
                setCourses([
                    { _id: '1', name: 'Full Stack Web Development' },
                    { _id: '2', name: 'Python Programming' },
                    { _id: '3', name: 'Data Science & ML' },
                    { _id: '4', name: 'Tally Prime + GST' },
                    { _id: '5', name: 'Graphic Design' },
                    { _id: '6', name: 'Advanced Excel & VBA' },
                ]);
            }
        };
        fetchCourses();
    }, []);

    const onSubmit = async (data) => {
        try {
            await API.post('/enquiries', data);
            setSubmitted(true);
            toast.success('Enquiry submitted successfully!');
            reset();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        }
    };

    if (submitted) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card text-center max-w-md mx-auto p-10"
                >
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <HiCheckCircle className="text-4xl text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">Enquiry Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for your interest. Our team will contact you shortly.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="btn-primary">
                        Submit Another Enquiry
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Enquiry Form | Pretech Computer Education</title>
            </Helmet>

            <div className="pt-24 pb-12 gradient-bg">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">Enquiry Form</h1>
                    <p className="text-white/70 text-lg">Interested in our courses? Send us your enquiry</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12 -mt-8">
                <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="card p-8"
                >
                    <div className="space-y-5">
                        <div>
                            <label className="label">Full Name *</label>
                            <input
                                {...register('fullName', { required: 'Full name is required' })}
                                className="input-field"
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>

                        <div>
                            <label className="label">Father/Husband Name *</label>
                            <input
                                {...register('fatherHusbandName', { required: 'This field is required' })}
                                className="input-field"
                                placeholder="Enter father/husband name"
                            />
                            {errors.fatherHusbandName && <p className="text-red-500 text-xs mt-1">{errors.fatherHusbandName.message}</p>}
                        </div>

                        <div>
                            <label className="label">Mobile Number *</label>
                            <input
                                {...register('mobile', {
                                    required: 'Mobile number is required',
                                    pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit mobile number' }
                                })}
                                className="input-field"
                                placeholder="Enter 10-digit mobile number"
                            />
                            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                        </div>

                        <div>
                            <label className="label">Course Interested *</label>
                            <select
                                {...register('courseInterested', { required: 'Please select a course' })}
                                className="input-field"
                            >
                                <option value="">Select a course</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            {errors.courseInterested && <p className="text-red-500 text-xs mt-1">{errors.courseInterested.message}</p>}
                        </div>

                        <div>
                            <label className="label">Preferred Batch Time *</label>
                            <select
                                {...register('preferredBatchTime', { required: 'Please select a batch time' })}
                                className="input-field"
                            >
                                <option value="">Select batch timing</option>
                                <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                                <option value="Afternoon (12PM-3PM)">Afternoon (12PM-3PM)</option>
                                <option value="Evening (3PM-6PM)">Evening (3PM-6PM)</option>
                                <option value="Weekend">Weekend</option>
                            </select>
                            {errors.preferredBatchTime && <p className="text-red-500 text-xs mt-1">{errors.preferredBatchTime.message}</p>}
                        </div>

                        <div>
                            <label className="label">Message (Optional)</label>
                            <textarea
                                {...register('message')}
                                className="input-field"
                                rows="3"
                                placeholder="Any questions or specific requirements..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full !py-3.5 text-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                        </button>
                    </div>
                </motion.form>
            </div>
        </>
    );
};

export default EnquiryForm;
