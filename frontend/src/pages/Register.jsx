import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register: authRegister, loading } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await authRegister(data.name, data.email, data.password);
            toast.success('Registration successful!');
            navigate('/student/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <>
            <Helmet>
                <title>Register | Pretech Computer Education</title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 pt-20 pb-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="card p-8">
                        <div className="text-center mb-8">
                            <img src="/logo.png" alt="Pretech Logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
                            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Create Account</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join Pretech Computer Education</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    className="input-field"
                                    placeholder="Your full name"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    {...register('email', { required: 'Email is required' })}
                                    className="input-field"
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                        className="input-field !pr-12"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? <HiEyeOff /> : <HiEye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="label">Confirm Password</label>
                                <input
                                    type="password"
                                    {...register('confirmPassword', { required: 'Please confirm password' })}
                                    className="input-field"
                                    placeholder="Confirm password"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !py-3.5 text-lg disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-700 dark:text-primary-400 font-medium hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Register;
