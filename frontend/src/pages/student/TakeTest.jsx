import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiClock, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const TakeTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: selectedOption }
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // seconds
    const timerRef = useRef(null);
    const hasSubmittedRef = useRef(false);

    const rolePrefix = user?.role === 'teacher' ? '/teacher' : '/student';

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await API.get(`/tests/${id}/attempt`);
                setTest(data);
                if (data.duration > 0) {
                    setTimeLeft(data.duration * 60);
                }
            } catch (err) {
                const msg = err.response?.data?.message || 'Failed to load test';
                setError(msg);
                if (err.response?.data?.submission) {
                    // Already submitted — redirect to result
                    setTimeout(() => navigate(`${rolePrefix}/test/${id}/result`), 1500);
                }
            }
            setLoading(false);
        };
        fetchTest();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [id]);

    const handleSubmit = useCallback(async (isAutoSubmit = false) => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;

        if (!isAutoSubmit) {
            const unanswered = test.questions.length - Object.keys(answers).length;
            if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
                hasSubmittedRef.current = false;
                return;
            }
        }

        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const answerArray = Object.entries(answers).map(([qIdx, selOpt]) => ({
                questionIndex: test.questions[Number(qIdx)].originalIndex !== undefined ? test.questions[Number(qIdx)].originalIndex : Number(qIdx),
                selectedOption: selOpt
            }));
            await API.post(`/tests/${id}/submit`, { answers: answerArray });
            toast.success(isAutoSubmit ? 'Time up! Test auto-submitted' : 'Test submitted successfully!');
            navigate(`${rolePrefix}/test/${id}/result`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
            hasSubmittedRef.current = false;
        }
        setSubmitting(false);
    }, [answers, test, id, navigate, rolePrefix]);

    // Timer
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timeLeft !== null]); // only start once

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const selectAnswer = (optionIdx) => {
        setAnswers({ ...answers, [currentQ]: optionIdx });
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    if (error) return (
        <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
            <div className="max-w-xl mx-auto px-4 text-center">
                <div className="card py-12">
                    <p className="text-xl font-bold text-red-600 mb-2">⚠️ {error}</p>
                    <button onClick={() => navigate(`${rolePrefix}/dashboard`)} className="btn-primary mt-4">Back to Dashboard</button>
                </div>
            </div>
        </div>
    );

    if (!test) return null;
    const question = test.questions[currentQ];
    const totalQ = test.questions.length;

    return (
        <>
            <Helmet><title>{test.title} | Test</title></Helmet>
            <div className="pt-20 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* Top Bar */}
                    <div className="card mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{test.title}</h1>
                            <p className="text-xs text-gray-500">{test.course?.name} • {totalQ} Questions • {test.totalMarks} Marks</p>
                        </div>
                        {timeLeft !== null && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${timeLeft <= 60 ? 'bg-red-100 text-red-700 animate-pulse' : timeLeft <= 300 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-white'}`}>
                                <HiClock /> {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {/* Question Navigation Sidebar */}
                        <div className="hidden md:block w-48 shrink-0">
                            <div className="card sticky top-24">
                                <h3 className="text-xs font-semibold text-gray-500 mb-3">Questions</h3>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {test.questions.map((_, i) => (
                                        <button key={i} onClick={() => setCurrentQ(i)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentQ === i ? 'bg-primary-600 text-white' :
                                                answers[i] !== undefined ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-1 text-[10px] text-gray-500">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-100 rounded"></span> Answered ({Object.keys(answers).length})</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-100 rounded"></span> Not Answered ({totalQ - Object.keys(answers).length})</div>
                                </div>
                            </div>
                        </div>

                        {/* Question Area */}
                        <div className="flex-1">
                            <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                                        Question {currentQ + 1} of {totalQ}
                                    </span>
                                    <span className="text-xs text-gray-500">{question.marks || 1} mark{(question.marks || 1) > 1 ? 's' : ''}</span>
                                </div>

                                {/* Question Text */}
                                {question.questionText && (
                                    <p className="text-base text-gray-900 dark:text-white font-medium mb-4 leading-relaxed">{question.questionText}</p>
                                )}

                                {/* Question Image */}
                                {question.questionImage && (
                                    <div className="mb-4">
                                        <img src={question.questionImage} alt="Question" className="max-w-full max-h-64 rounded-xl border border-gray-200 dark:border-dark-border" />
                                    </div>
                                )}

                                {/* Options */}
                                <div className="space-y-3">
                                    {question.options.map((opt, oIdx) => (
                                        <button key={oIdx} onClick={() => selectAnswer(oIdx)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQ] === oIdx ?
                                                'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-300' :
                                                'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-primary-300 hover:bg-primary-50/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${answers[currentQ] === oIdx ?
                                                    'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400'}`}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </span>
                                                <span className={`text-sm ${answers[currentQ] === oIdx ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {opt.text}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                                        className="btn-outline px-4 py-2 text-sm flex items-center gap-1 disabled:opacity-40">
                                        <HiChevronLeft /> Previous
                                    </button>

                                    {/* Mobile question counter */}
                                    <span className="md:hidden text-xs text-gray-500">{Object.keys(answers).length}/{totalQ} answered</span>

                                    {currentQ < totalQ - 1 ? (
                                        <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1">
                                            Next <HiChevronRight />
                                        </button>
                                    ) : (
                                        <button onClick={() => handleSubmit(false)} disabled={submitting}
                                            className="px-6 py-2 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                                            {submitting ? 'Submitting...' : '✓ Submit Test'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TakeTest;
