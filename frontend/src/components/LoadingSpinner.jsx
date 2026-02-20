import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <motion.div
                className={`${sizes[size]} rounded-full border-4 border-primary-200 border-t-primary-700 dark:border-dark-border dark:border-t-primary-500`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            {text && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
