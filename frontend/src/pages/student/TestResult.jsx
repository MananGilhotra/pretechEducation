import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCheck, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const TestResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const rolePrefix = user?.role === 'teacher' ? '/teacher' : '/student';

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const { data } = await API.get(`/tests/${id}/my-result`);
                setResult(data);
            } catch {
                setResult(null);
            }
            setLoading(false);
        };
        fetchResult();
    }, [id]);

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    if (!result) return (
        <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
            <div className="max-w-xl mx-auto px-4 text-center">
                <div className="card py-12">
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No result found</p>
                    <button onClick={() => navigate(`${rolePrefix}/dashboard`)} className="btn-primary mt-4">Back to Dashboard</button>
                </div>
            </div>
        </div>
    );

    const { submission, test } = result;
    const answerMap = {};
    (submission.answers || []).forEach(a => { answerMap[a.questionIndex] = a.selectedOption; });

    const getGrade = (pct) => {
        if (pct >= 90) return { label: 'Excellent!', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', emoji: '🌟' };
        if (pct >= 75) return { label: 'Very Good', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', emoji: '👏' };
        if (pct >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', emoji: '👍' };
        if (pct >= 33) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', emoji: '📖' };
        return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', emoji: '💪' };
    };

    const grade = getGrade(submission.percentage);

    return (
        <>
            <Helmet><title>Test Result | {test?.title}</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <button onClick={() => navigate(`${rolePrefix}/dashboard`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
                        <HiArrowLeft /> Back to Dashboard
                    </button>

                    {/* Score Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`card mb-6 ${grade.bg}`}>
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">{grade.emoji}</div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{test?.title}</h1>
                            <p className="text-sm text-gray-500 mb-4">{test?.course?.name}</p>

                            <div className="flex items-center justify-center gap-8">
                                <div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{submission.score}<span className="text-lg text-gray-500">/{submission.totalMarks}</span></div>
                                    <div className="text-xs text-gray-500 mt-1">Score</div>
                                </div>
                                <div className="w-px h-12 bg-gray-200 dark:bg-dark-border"></div>
                                <div>
                                    <div className={`text-3xl font-bold ${grade.color}`}>{submission.percentage}%</div>
                                    <div className="text-xs text-gray-500 mt-1">Percentage</div>
                                </div>
                            </div>
                            <p className={`text-sm font-bold mt-3 ${grade.color}`}>{grade.label}</p>
                        </div>
                    </motion.div>

                    {/* Question-by-Question Review */}
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Question Review</h2>
                    <div className="space-y-4">
                        {test?.questions?.map((q, qIdx) => {
                            const selected = answerMap[qIdx];
                            const correctIdx = q.options.findIndex(o => o.isCorrect);
                            const isCorrect = selected === correctIdx;
                            const isUnanswered = selected === undefined || selected === -1;

                            return (
                                <div key={qIdx} className={`card border-l-4 ${isUnanswered ? 'border-l-gray-400' : isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-500">Q{qIdx + 1} ({q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''})</span>
                                        {isUnanswered ? (
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Not Answered</span>
                                        ) : isCorrect ? (
                                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1"><HiCheck /> Correct</span>
                                        ) : (
                                            <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1"><HiX /> Wrong</span>
                                        )}
                                    </div>

                                    {q.questionText && <p className="text-sm text-gray-900 dark:text-white font-medium mb-3">{q.questionText}</p>}
                                    {q.questionImage && <img src={q.questionImage} alt="Q" className="max-w-full max-h-48 rounded-lg mb-3 border border-gray-200 dark:border-dark-border" />}

                                    <div className="space-y-2">
                                        {q.options.map((opt, oIdx) => {
                                            let styles = 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border';
                                            if (opt.isCorrect) styles = 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
                                            else if (oIdx === selected && !isCorrect) styles = 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';

                                            return (
                                                <div key={oIdx} className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${styles}`}>
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${opt.isCorrect ? 'bg-green-600 text-white' : oIdx === selected && !isCorrect ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400'}`}>
                                                        {opt.isCorrect ? <HiCheck /> : oIdx === selected && !isCorrect ? <HiX /> : String.fromCharCode(65 + oIdx)}
                                                    </span>
                                                    <span className={`text-sm ${opt.isCorrect ? 'text-green-700 dark:text-green-400 font-medium' : oIdx === selected && !isCorrect ? 'text-red-700 dark:text-red-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{opt.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TestResult;
