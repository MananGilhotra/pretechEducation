import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenu, HiX, HiSun, HiMoon, HiAcademicCap } from 'react-icons/hi';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'Enquiry', path: '/enquiry' },
        { name: 'Admission', path: '/admission' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'glass shadow-lg border-b border-gray-200/50 dark:border-dark-border/50'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <HiAcademicCap className="text-white text-xl" />
                        </div>
                        <div>
                            <span className="text-lg font-bold font-heading text-primary-800 dark:text-white">
                                Pretech
                            </span>
                            <span className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 -mt-1 leading-none">
                                Computer Education
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                                    ? 'bg-primary-700/10 text-primary-700 dark:bg-primary-400/10 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-gray-100/50 dark:hover:bg-dark-card/50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border transition-all"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <HiSun className="text-lg" /> : <HiMoon className="text-lg" />}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to={isAdmin ? '/admin/dashboard' : user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                                    className="btn-primary text-sm !px-4 !py-2"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="btn-outline text-sm !px-4 !py-2">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="lg:hidden flex items-center space-x-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300"
                        >
                            {darkMode ? <HiSun /> : <HiMoon />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300"
                        >
                            {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden glass border-t border-gray-200/50 dark:border-dark-border/50"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === link.path
                                        ? 'bg-primary-700/10 text-primary-700'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
                                {user ? (
                                    <>
                                        <Link
                                            to={isAdmin ? '/admin/dashboard' : user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                                            className="block px-4 py-3 text-sm font-medium text-primary-700 dark:text-primary-400"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-3 text-sm font-medium text-red-500"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex space-x-2 pt-2">
                                        <Link to="/login" className="btn-outline text-sm flex-1 text-center !py-2">
                                            Login
                                        </Link>
                                        <Link to="/register" className="btn-primary text-sm flex-1 text-center !py-2">
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
