import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            const user = await login(data.email, data.password);
            toast.success('Login successful!');
            navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <>
            <Helmet>
                <title>Login | Pretech Computer Education</title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 pt-20">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="card p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <HiAcademicCap className="text-white text-3xl" />
                            </div>
                            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Welcome Back</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your Pretech account</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                                        {...register('password', { required: 'Password is required' })}
                                        className="input-field !pr-12"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <HiEyeOff /> : <HiEye />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !py-3.5 text-lg disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-700 dark:text-primary-400 font-medium hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Login;
