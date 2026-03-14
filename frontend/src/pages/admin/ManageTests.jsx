import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiEye, HiX, HiClipboardList, HiUpload, HiCheck, HiChevronDown, HiChevronUp, HiDocumentText, HiRefresh } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';


const ManageTests = () => {
    const [tests, setTests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [showSubmissions, setShowSubmissions] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubs, setLoadingSubs] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkTestId, setBulkTestId] = useState(null);

    // Form state
    const [form, setForm] = useState({
        title: '', description: '', course: '', batches: [], forTeachers: false, duration: 0, status: 'Draft'
    });
    const [questions, setQuestions] = useState([]);
    const [saving, setSaving] = useState(false);

    const fetchTests = async () => {
        try {
            const { data } = await API.get('/tests');
            setTests(data);
        } catch { setTests([]); }
        finally { setLoading(false); }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/courses?status=Active');
            setCourses(data);
        } catch { setCourses([]); }
    };

    useEffect(() => { fetchTests(); fetchCourses(); }, []);

    const resetForm = () => {
        setForm({ title: '', description: '', course: '', batches: [], forTeachers: false, duration: 0, status: 'Draft' });
        setQuestions([]);
        setEditingTest(null);
    };

    const openCreate = () => {
        resetForm();
        setShowForm(true);
    };

    const openEdit = async (test) => {
        try {
            const { data } = await API.get(`/tests/${test._id}`);
            setForm({
                title: data.title || '',
                description: data.description || '',
                course: data.course?._id || data.course || '',
                batches: data.batches || [],
                forTeachers: data.forTeachers || false,
                duration: data.duration || 0,
                status: data.status || 'Draft'
            });
            setQuestions(data.questions || []);
            setEditingTest(data);
            setShowForm(true);
        } catch { toast.error('Failed to load test'); }
    };

    const handleSave = async () => {
        if (!form.title || !form.course || form.batches.length === 0) {
            toast.error('Title, course, and at least one batch are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, questions };
            if (editingTest) {
                await API.put(`/tests/${editingTest._id}`, payload);
                toast.success('Test updated');
            } else {
                await API.post('/tests', payload);
                toast.success('Test created');
            }
            setShowForm(false);
            resetForm();
            fetchTests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/tests/${deleteModal.id}`);
            toast.success('Test deleted');
            fetchTests();
            setDeleteModal({ isOpen: false, id: null });
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    const handleStatusChange = async (testId, newStatus) => {
        try {
            await API.put(`/tests/${testId}`, { status: newStatus });
            toast.success(`Test ${newStatus.toLowerCase()}`);
            fetchTests();
        } catch { toast.error('Status update failed'); }
    };

    const viewSubmissions = async (test) => {
        setShowSubmissions(test);
        setLoadingSubs(true);
        try {
            const { data } = await API.get(`/tests/${test._id}/submissions`);
            setSubmissions(data);
        } catch { setSubmissions([]); }
        finally { setLoadingSubs(false); }
    };

    const handleBulkImport = async () => {
        if (!bulkText.trim()) { toast.error('Paste question text first'); return; }
        try {
            const { data } = await API.post(`/tests/${bulkTestId}/import`, { text: bulkText });
            toast.success(data.message);
            setBulkText('');
            setShowBulkImport(false);
            fetchTests();
        } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    };

    const handleResetSubmission = async (testId, submissionId, name) => {
        if (!window.confirm(`Reset submission for "${name}"? They will be able to retake the test.`)) return;
        try {
            await API.delete(`/tests/${testId}/submissions/${submissionId}`);
            toast.success(`Submission reset for ${name}`);
            setSubmissions(prev => prev.filter(s => s._id !== submissionId));
        } catch (err) { toast.error(err.response?.data?.message || 'Reset failed'); }
    };

    // ---- Question builder helpers ----
    const addQuestion = () => {
        setQuestions([...questions, {
            questionText: '',
            questionImage: '',
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
            marks: 1
        }]);
    };

    const updateQuestion = (idx, field, value) => {
        const updated = [...questions];
        updated[idx] = { ...updated[idx], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIdx, oIdx, field, value) => {
        const updated = [...questions];
        if (field === 'isCorrect' && value === true) {
            // Only one correct answer
            updated[qIdx].options = updated[qIdx].options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
        } else {
            updated[qIdx].options[oIdx] = { ...updated[qIdx].options[oIdx], [field]: value };
        }
        setQuestions(updated);
    };

    const removeQuestion = (idx) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handleQuestionImage = (qIdx, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            updateQuestion(qIdx, 'questionImage', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const toggleBatch = (batch) => {
        setForm(prev => ({
            ...prev,
            batches: prev.batches.includes(batch) ? prev.batches.filter(b => b !== batch) : [...prev.batches, batch]
        }));
    };

    if (loading) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Manage Tests | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">📝 Manage Tests</h1>
                            <p className="text-gray-500 mt-1">{tests.length} tests created</p>
                        </div>
                        <button onClick={openCreate} className="btn-primary self-start flex items-center gap-2">
                            <HiPlus /> Create Test
                        </button>
                    </div>

                    {/* Test Cards */}
                    {tests.length === 0 ? (
                        <div className="card text-center py-16">
                            <HiClipboardList className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Tests Yet</h3>
                            <p className="text-gray-500 mb-6">Create your first MCQ test</p>
                            <button onClick={openCreate} className="btn-primary">Create Test</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tests.map(test => (
                                <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{test.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${test.status === 'Published' ? 'bg-green-100 text-green-700' : test.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {test.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 mb-4">
                                        <p className="text-xs text-gray-500"><strong>Course:</strong> {test.course?.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-500"><strong>Batches:</strong> {test.batches?.join(', ')}</p>
                                        <p className="text-xs text-gray-500"><strong>Questions:</strong> {test.questions?.length || 0} | <strong>Marks:</strong> {test.totalMarks}</p>
                                        <p className="text-xs text-gray-500"><strong>Duration:</strong> {test.duration ? `${test.duration} min` : 'No limit'}</p>
                                        {test.forTeachers && <p className="text-xs text-indigo-600 font-medium">📚 Also for Teachers</p>}
                                        <p className="text-xs text-gray-400"><strong>Submissions:</strong> {test.submissionCount || 0}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 border-t border-gray-100 dark:border-dark-border pt-3">
                                        <button onClick={() => openEdit(test)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"><HiPencil /> Edit</button>
                                        <button onClick={() => viewSubmissions(test)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"><HiEye /> Results</button>
                                        <button onClick={() => { setBulkTestId(test._id); setShowBulkImport(true); }} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex items-center gap-1"><HiUpload /> Import</button>
                                        {test.status === 'Draft' && (
                                            <button onClick={() => handleStatusChange(test._id, 'Published')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Publish</button>
                                        )}
                                        {test.status === 'Published' && (
                                            <button onClick={() => handleStatusChange(test._id, 'Closed')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">Close</button>
                                        )}
                                        {test.status === 'Closed' && (
                                            <button onClick={() => handleStatusChange(test._id, 'Published')} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Re-open</button>
                                        )}
                                        <button onClick={() => setDeleteModal({ isOpen: true, id: test._id })} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1"><HiTrash /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ======================== CREATE / EDIT MODAL ======================== */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => { setShowForm(false); resetForm(); }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card w-full max-w-4xl my-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingTest ? 'Edit Test' : 'Create New Test'}</h2>
                                <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"><HiX className="text-xl" /></button>
                            </div>

                            {/* Test Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Test Title *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Chapter 5 Quiz" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label text-xs">Description / Instructions</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows="2" placeholder="Optional instructions for students..." />
                                </div>
                                <div>
                                    <label className="label text-xs">Course *</label>
                                    <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className="input-field">
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label text-xs">Duration (minutes, 0 = no limit)</label>
                                    <input type="number" min="0" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="input-field" />
                                </div>
                                <div>
                                    <label className="label text-xs">Batches *</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {(courses.find(c => c._id === form.course)?.batchSlots || []).map(batch => (
                                            <button key={batch} type="button" onClick={() => toggleBatch(batch)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.batches.includes(batch) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-primary-400'}`}>
                                                {form.batches.includes(batch) && <HiCheck className="inline mr-1" />}{batch}
                                            </button>
                                        ))}
                                        {!form.course && <span className="text-xs text-gray-400">Select a course first</span>}
                                    </div>
                                </div>
                                <div className="flex items-end gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.forTeachers} onChange={e => setForm({ ...form, forTeachers: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Also available for Teachers</span>
                                    </label>
                                </div>
                            </div>

                            {/* Questions Section */}
                            <div className="border-t border-gray-200 dark:border-dark-border pt-5 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Questions ({questions.length})</h3>
                                    <button onClick={addQuestion} className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"><HiPlus /> Add Question</button>
                                </div>

                                {questions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-dark-bg rounded-xl">
                                        <HiDocumentText className="text-3xl mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No questions yet. Click "Add Question" or use "Bulk Import".</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                                        {questions.map((q, qIdx) => (
                                            <QuestionCard
                                                key={qIdx}
                                                question={q}
                                                index={qIdx}
                                                onUpdate={updateQuestion}
                                                onUpdateOption={updateOption}
                                                onRemove={removeQuestion}
                                                onImageUpload={handleQuestionImage}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Save */}
                            <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-dark-border pt-4">
                                <button onClick={() => { setShowForm(false); resetForm(); }} className="btn-outline px-5">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn-primary px-7">
                                    {saving ? 'Saving...' : editingTest ? 'Update Test' : 'Create Test'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================== SUBMISSIONS MODAL ======================== */}
            <AnimatePresence>
                {showSubmissions && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSubmissions(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Results</h2>
                                    <p className="text-sm text-gray-500">{showSubmissions.title}</p>
                                </div>
                                <button onClick={() => setShowSubmissions(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"><HiX className="text-xl" /></button>
                            </div>

                            {loadingSubs ? (
                                <div className="text-center py-8 text-gray-500">Loading submissions...</div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No submissions yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">#</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Score</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">%</th>
                                                <th className="text-left py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                                                <th className="text-center py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map((sub, i) => (
                                                <tr key={sub._id} className="border-b border-gray-100 dark:border-dark-border">
                                                    <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="font-medium text-gray-900 dark:text-white">{sub.submitterName}</div>
                                                        {sub.submitterStudentId && <div className="text-xs text-gray-500 font-mono">{sub.submitterStudentId}</div>}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.submitterType === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{sub.submitterType}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">{sub.score}/{sub.totalMarks}</td>
                                                    <td className="py-2.5 px-3">
                                                        <span className={`font-bold ${sub.percentage >= 60 ? 'text-green-600' : sub.percentage >= 33 ? 'text-amber-600' : 'text-red-600'}`}>{sub.percentage}%</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-500 text-xs">{new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <button
                                                            onClick={() => handleResetSubmission(showSubmissions._id, sub._id, sub.submitterName)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1 mx-auto"
                                                            title="Reset — allow retake"
                                                        >
                                                            <HiRefresh /> Reset
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================== BULK IMPORT MODAL ======================== */}
            <AnimatePresence>
                {showBulkImport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowBulkImport(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="card w-full max-w-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Import Questions</h2>
                                <button onClick={() => setShowBulkImport(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"><HiX className="text-xl" /></button>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-1">Format each question like this:</p>
                                <pre className="text-xs text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
{`Q: What is the capital of India?
A: Mumbai
B: New Delhi
C: Kolkata
D: Chennai
Ans: B

Q: Which planet is known as the Red Planet?
A: Venus
B: Jupiter
C: Mars
D: Saturn
Ans: C`}
                                </pre>
                            </div>

                            <textarea
                                value={bulkText}
                                onChange={e => setBulkText(e.target.value)}
                                className="input-field font-mono text-sm"
                                rows="12"
                                placeholder="Paste your questions here in the format above..."
                            />

                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setShowBulkImport(false)} className="btn-outline px-5">Cancel</button>
                                <button onClick={handleBulkImport} className="btn-primary px-7 flex items-center gap-2"><HiUpload /> Import</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Test"
                message="Are you sure? This will delete the test and all student submissions permanently."
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                confirmText="Delete Test"
                confirmColor="red"
            />
        </>
    );
};

// ======================== QUESTION CARD COMPONENT ========================
const QuestionCard = ({ question, index, onUpdate, onUpdateOption, onRemove, onImageUpload }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                    {collapsed ? <HiChevronDown /> : <HiChevronUp />}
                    Q{index + 1}
                    {question.questionText && <span className="font-normal text-gray-500 text-xs line-clamp-1 max-w-xs">— {question.questionText}</span>}
                </button>
                <div className="flex items-center gap-2">
                    <input type="number" min="1" value={question.marks} onChange={e => onUpdate(index, 'marks', Number(e.target.value) || 1)}
                        className="w-16 input-field py-1 text-xs text-center" title="Marks" />
                    <span className="text-xs text-gray-500">marks</span>
                    <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"><HiTrash /></button>
                </div>
            </div>

            {!collapsed && (
                <div className="space-y-3">
                    <div>
                        <textarea value={question.questionText} onChange={e => onUpdate(index, 'questionText', e.target.value)}
                            className="input-field text-sm" rows="2" placeholder="Enter question text..." />
                    </div>

                    {/* Question Image */}
                    <div className="flex items-center gap-3">
                        {question.questionImage && (
                            <img src={question.questionImage} alt="Q" className="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-dark-border" />
                        )}
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Question Image (optional)</label>
                            <input type="file" accept="image/*" onChange={e => onImageUpload(index, e)} className="text-xs" />
                        </div>
                        {question.questionImage && (
                            <button onClick={() => onUpdate(index, 'questionImage', '')} className="text-xs text-red-500 hover:underline">Remove</button>
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-medium">Options (click radio to mark correct):</label>
                        {question.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${opt.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'}`}>
                                <input type="radio" name={`correct-${index}`} checked={opt.isCorrect} onChange={() => onUpdateOption(index, oIdx, 'isCorrect', true)}
                                    className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-bold text-gray-500 w-4">{String.fromCharCode(65 + oIdx)}</span>
                                <input value={opt.text} onChange={e => onUpdateOption(index, oIdx, 'text', e.target.value)}
                                    className="flex-1 input-field py-1 text-sm" placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                                {opt.isCorrect && <span className="text-xs text-green-600 font-bold whitespace-nowrap">✓ Correct</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTests;
