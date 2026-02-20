import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCheckCircle, HiCurrencyRupee, HiDownload, HiXCircle } from 'react-icons/hi';
import API from '../api/axios';

const Payment = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { admission, admissionId } = location.state || {};
    const [paymentDone, setPaymentDone] = useState(false);
    const [paymentFailed, setPaymentFailed] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [transactionId, setTransactionId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!transactionId) return toast.error('Please enter Transaction ID');

        setLoading(true);
        try {
            await API.post('/payments/manual', {
                admissionId,
                amount: payableAmount,
                transactionId,
                paymentMethod: 'Manual'
            });
            setSubmitted(true);
            toast.success('Payment details submitted for verification');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card text-center max-w-lg mx-auto p-10">
                    <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
                        <HiCheckCircle className="text-5xl text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">Payment Submitted</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your transaction ID <strong>{transactionId}</strong> has been submitted.
                        Please wait for admin approval (usually within 24 hours). You will receive an email once approved.
                    </p>
                    <div className="space-y-2">
                        <Link to="/" className="btn-primary block">Back to Home</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // No admission data
    if (!admission) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
                <div className="card text-center max-w-md p-10">
                    <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-4">No Admission Found</h2>
                    <Link to="/admission" className="btn-primary">Go to Admission Form</Link>
                </div>
            </div>
        );
    }

    const isInstallment = admission?.paymentPlan === 'Installment';
    const nextInstallment = isInstallment ? admission.installments.find(i => i.status === 'Pending') : null;
    const payableAmount = isInstallment ? (nextInstallment?.amount || 0) : (admission.finalFees !== undefined ? admission.finalFees : admission.courseApplied?.fees);

    return (
        <>
            <Helmet>
                <title>Payment | Pretech Computer Education</title>
            </Helmet>

            <div className="pt-24 min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Payment Details */}
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card p-8 h-fit">
                            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-6">Admission Details</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                    <span className="text-gray-500">Student Name</span>
                                    <span className="font-semibold dark:text-white">{admission.name}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                    <span className="text-gray-500">Course</span>
                                    <span className="font-semibold dark:text-white">{admission.courseApplied?.name}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                    <span className="text-gray-500">Payment Type</span>
                                    <span className="font-semibold dark:text-white">{isInstallment ? `Installment ${nextInstallment?.number}` : 'Full Payment'}</span>
                                </div>
                                <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary-900 dark:text-primary-100">Amount to Pay</span>
                                    <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">₹{payableAmount?.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Scan & Pay */}
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="card p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2">Scan & Pay</h2>
                                <p className="text-sm text-gray-500">Scan the QR code below using any UPI app (GPay, PhonePe, Paytm)</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 mb-6 inline-block w-full">
                                <img src="/payment-qr.jpg" alt="Payment QR Code" className="w-48 h-48 mx-auto object-contain" />
                                <p className="text-center text-xs text-gray-400 mt-2">UPI: 9929945446@ptaxis</p>
                            </div>

                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Enter Transaction ID / UTR *</label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="input-field text-center font-mono tracking-wider"
                                        placeholder="e.g. 405912345678"
                                        required
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Enter the 12-digit UTR number from your payment app</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !transactionId}
                                    className="btn-primary w-full py-3"
                                >
                                    {loading ? 'Submitting...' : 'Submit Payment Details'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Payment;

