import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
    return (
        <>
            <Helmet>
                <title>404 - Page Not Found | Pretech Computer Education</title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-[150px] font-bold font-heading gradient-text leading-none"
                    >
                        404
                    </motion.div>
                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-white mt-4 mb-3">
                        Page Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved. Let's get you back to learning!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/" className="btn-primary">Back to Home</Link>
                        <Link to="/courses" className="btn-outline">Browse Courses</Link>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default NotFound;
