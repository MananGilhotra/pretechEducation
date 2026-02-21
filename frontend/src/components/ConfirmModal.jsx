import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation, HiX } from 'react-icons/hi';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'red' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-${confirmColor}-100 text-${confirmColor}-600 dark:bg-${confirmColor}-900/30 dark:text-${confirmColor}-400`}>
                                    <HiExclamation className="text-xl" />
                                </div>
                                <div className="mt-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-bg px-5 py-3 flex justify-end gap-3 border-t border-gray-100 dark:border-dark-border">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-dark-card dark:text-gray-300 dark:border-dark-border dark:hover:bg-dark-border transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                        confirmColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                            'bg-primary-600 hover:bg-primary-700'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
