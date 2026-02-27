import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCheck, HiX, HiClipboardList, HiCalendar, HiAcademicCap, HiChartBar, HiRefresh, HiUserGroup, HiUsers } from 'react-icons/hi';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageAttendance = () => {
    // ─── Shared State ───
    const [mode, setMode] = useState('students'); // 'students' | 'teachers'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tab, setTab] = useState('mark'); // 'mark' | 'summary'
    const [summaryFrom, setSummaryFrom] = useState('');
    const [summaryTo, setSummaryTo] = useState('');

    // ─── Student State ───
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [studentAttMap, setStudentAttMap] = useState({});
    const [studentSummary, setStudentSummary] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // ─── Teacher State ───
    const [teachers, setTeachers] = useState([]);
    const [teacherAttMap, setTeacherAttMap] = useState({});
    const [teacherSummary, setTeacherSummary] = useState([]);

    // ─── Loading States ───
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Reset tab when switching mode
    useEffect(() => { setTab('mark'); }, [mode]);

    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses');
                setCourses(data.filter(c => c.status === 'Active'));
            } catch { setCourses([]); }
            finally { setLoadingCourses(false); }
        };
        fetchCourses();
    }, []);

    // =================== STUDENT FUNCTIONS ===================
    const loadStudentAttendance = async () => {
        if (!selectedCourse || !selectedDate) { toast.error('Select course & date'); return; }
        setLoading(true);
        try {
            const { data: admissions } = await API.get('/admissions');
            const courseStudents = admissions.filter(a => a.courseApplied?._id === selectedCourse && a.approved);
            setStudents(courseStudents);

            const { data: records } = await API.get('/attendance', { params: { course: selectedCourse, date: selectedDate } });
            const map = {};
            courseStudents.forEach(s => { map[s._id] = 'Absent'; });
            records.forEach(r => { if (r.student?._id) map[r.student._id] = r.status; });
            setStudentAttMap(map);
        } catch { toast.error('Failed to load'); setStudents([]); setStudentAttMap({}); }
        finally { setLoading(false); }
    };

    const submitStudentAttendance = async () => {
        if (!students.length) return;
        setSubmitting(true);
        try {
            const records = students.map(s => ({ studentId: s._id, status: studentAttMap[s._id] || 'Absent' }));
            await API.post('/attendance/mark', { courseId: selectedCourse, date: selectedDate, records });
            const p = records.filter(r => r.status === 'Present').length;
            toast.success(`Saved! ${p}/${records.length} present`);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const loadStudentSummary = async () => {
        if (!selectedCourse) { toast.error('Select a course'); return; }
        setLoadingSummary(true);
        try {
            const params = { course: selectedCourse };
            if (summaryFrom) params.from = summaryFrom;
            if (summaryTo) params.to = summaryTo;
            const { data } = await API.get('/attendance/summary', { params });
            setStudentSummary(data);
        } catch { toast.error('Failed'); setStudentSummary([]); }
        finally { setLoadingSummary(false); }
    };

    // =================== TEACHER FUNCTIONS ===================
    const loadTeacherAttendance = async () => {
        if (!selectedDate) { toast.error('Select a date'); return; }
        setLoading(true);
        try {
            const { data: allTeachers } = await API.get('/teachers');
            const active = allTeachers.filter(t => t.status === 'Active');
            setTeachers(active);

            const { data: records } = await API.get('/attendance/teachers', { params: { date: selectedDate } });
            const map = {};
            active.forEach(t => { map[t._id] = 'Absent'; });
            records.forEach(r => { if (r.teacher?._id) map[r.teacher._id] = r.status; });
            setTeacherAttMap(map);
        } catch { toast.error('Failed to load'); setTeachers([]); setTeacherAttMap({}); }
        finally { setLoading(false); }
    };

    const submitTeacherAttendance = async () => {
        if (!teachers.length) return;
        setSubmitting(true);
        try {
            const records = teachers.map(t => ({ teacherId: t._id, status: teacherAttMap[t._id] || 'Absent' }));
            await API.post('/attendance/teachers/mark', { date: selectedDate, records });
            const p = records.filter(r => r.status === 'Present').length;
            toast.success(`Saved! ${p}/${records.length} present`);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const loadTeacherSummary = async () => {
        setLoadingSummary(true);
        try {
            const params = {};
            if (summaryFrom) params.from = summaryFrom;
            if (summaryTo) params.to = summaryTo;
            const { data } = await API.get('/attendance/teachers/summary', { params });
            setTeacherSummary(data);
        } catch { toast.error('Failed'); setTeacherSummary([]); }
        finally { setLoadingSummary(false); }
    };

    // ─── Derived Values ───
    const currentAttMap = mode === 'students' ? studentAttMap : teacherAttMap;
    const currentSetAttMap = mode === 'students' ? setStudentAttMap : setTeacherAttMap;
    const currentList = mode === 'students' ? students : teachers;
    const presentCount = Object.values(currentAttMap).filter(s => s === 'Present').length;
    const absentCount = Object.values(currentAttMap).filter(s => s === 'Absent').length;
    const selectedCourseName = courses.find(c => c._id === selectedCourse)?.name || '';

    const toggleStatus = (id) => {
        currentSetAttMap(prev => ({ ...prev, [id]: prev[id] === 'Present' ? 'Absent' : 'Present' }));
    };

    const markAll = (status) => {
        const updated = {};
        currentList.forEach(item => { updated[item._id] = status; });
        currentSetAttMap(updated);
    };

    if (loadingCourses) return <div className="pt-24"><LoadingSpinner /></div>;

    return (
        <>
            <Helmet><title>Attendance Management | Admin</title></Helmet>
            <div className="pt-24 pb-8 bg-gray-50 dark:bg-dark-bg min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                                <HiClipboardList className="text-primary-700" />
                                Attendance Management
                            </h1>
                            <p className="text-gray-500 mt-1">Mark and track attendance for students & teachers</p>
                        </div>
                    </div>

                    {/* Mode Switcher: Students / Teachers */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setMode('students')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'students'
                                ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-lg shadow-primary-700/25'
                                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
                                }`}
                        >
                            <HiUsers className="inline mr-2 -mt-0.5" />Students
                        </button>
                        <button
                            onClick={() => setMode('teachers')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'teachers'
                                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/25'
                                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
                                }`}
                        >
                            <HiUserGroup className="inline mr-2 -mt-0.5" />Teachers
                        </button>
                    </div>

                    {/* Tab Switcher: Mark / Summary */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setTab('mark')}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'mark'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
                                }`}
                        >
                            <HiCalendar className="inline mr-2 -mt-0.5" />Mark Attendance
                        </button>
                        <button
                            onClick={() => setTab('summary')}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'summary'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
                                }`}
                        >
                            <HiChartBar className="inline mr-2 -mt-0.5" />Summary
                        </button>
                    </div>

                    {/* ─── Filter Bar ─── */}
                    <div className="card mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            {/* Course selector (students only) */}
                            {mode === 'students' && (
                                <div className="flex-1">
                                    <label className="label"><HiAcademicCap className="inline mr-1.5 text-primary-600" />Select Course</label>
                                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field">
                                        <option value="">— Choose a Course —</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {tab === 'mark' ? (
                                <>
                                    <div className={mode === 'teachers' ? 'flex-1' : 'w-full md:w-48'}>
                                        <label className="label"><HiCalendar className="inline mr-1.5 text-primary-600" />Date</label>
                                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field" />
                                    </div>
                                    <button onClick={mode === 'students' ? loadStudentAttendance : loadTeacherAttendance} className="btn-primary whitespace-nowrap">
                                        <HiRefresh className="inline mr-2 -mt-0.5" />Load {mode === 'students' ? 'Students' : 'Teachers'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-full md:w-44">
                                        <label className="label">From Date</label>
                                        <input type="date" value={summaryFrom} onChange={e => setSummaryFrom(e.target.value)} className="input-field" />
                                    </div>
                                    <div className="w-full md:w-44">
                                        <label className="label">To Date</label>
                                        <input type="date" value={summaryTo} onChange={e => setSummaryTo(e.target.value)} className="input-field" />
                                    </div>
                                    <button onClick={mode === 'students' ? loadStudentSummary : loadTeacherSummary} className="btn-primary whitespace-nowrap">
                                        <HiChartBar className="inline mr-2 -mt-0.5" />View Summary
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ===================== MARK TAB ===================== */}
                    {tab === 'mark' && (
                        <>
                            {loading ? (
                                <div className="py-12"><LoadingSpinner /></div>
                            ) : currentList.length > 0 ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    {/* Stats Bar */}
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        {mode === 'students' && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                                                <span className="text-xs text-gray-500">Course:</span>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedCourseName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                                            <span className="text-xs text-gray-500">Total:</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{currentList.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                            <span className="text-xs text-green-600">Present:</span>
                                            <span className="text-sm font-bold text-green-700 dark:text-green-400">{presentCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <span className="text-xs text-red-600">Absent:</span>
                                            <span className="text-sm font-bold text-red-700 dark:text-red-400">{absentCount}</span>
                                        </div>
                                        <div className="ml-auto flex gap-2">
                                            <button onClick={() => markAll('Present')} className="btn-outline text-xs !px-3 !py-1.5 !text-green-700 !border-green-300 hover:!bg-green-50">
                                                <HiCheck className="inline mr-1" />All Present
                                            </button>
                                            <button onClick={() => markAll('Absent')} className="btn-outline text-xs !px-3 !py-1.5 !text-red-700 !border-red-300 hover:!bg-red-50">
                                                <HiX className="inline mr-1" />All Absent
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="card overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 w-12">#</th>
                                                        {mode === 'students' && <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student ID</th>}
                                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                                        {mode === 'teachers' && <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Subject</th>}
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentList.map((item, i) => {
                                                        const status = currentAttMap[item._id] || 'Absent';
                                                        const isPresent = status === 'Present';
                                                        return (
                                                            <tr key={item._id} className={`border-b border-gray-100 dark:border-dark-border transition-colors ${isPresent ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-dark-card/50'}`}>
                                                                <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                                                                {mode === 'students' && <td className="py-3 px-4 font-mono text-primary-700 dark:text-primary-400 font-medium text-xs">{item.studentId}</td>}
                                                                <td className="py-3 px-4">
                                                                    <div className="text-gray-900 dark:text-white font-medium">{item.name}</div>
                                                                    {mode === 'students' && item.fatherHusbandName && <div className="text-xs text-gray-500 mt-0.5">S/D of {item.fatherHusbandName}</div>}
                                                                    {mode === 'teachers' && item.phone && <div className="text-xs text-gray-500 mt-0.5">{item.phone}</div>}
                                                                </td>
                                                                {mode === 'teachers' && <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{item.subject}</td>}
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPresent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                        {status}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button onClick={() => toggleStatus(item._id)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${isPresent ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                                        {isPresent ? '✗ Mark Absent' : '✓ Mark Present'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex justify-end mt-6">
                                        <button onClick={mode === 'students' ? submitStudentAttendance : submitTeacherAttendance} disabled={submitting} className="btn-primary px-8 py-3 text-base font-semibold disabled:opacity-50">
                                            {submitting ? 'Saving...' : `✓ Save Attendance (${presentCount}P / ${absentCount}A)`}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="card text-center py-12">
                                    <div className="text-4xl mb-3">{mode === 'students' ? '📅' : '👩‍🏫'}</div>
                                    <p className="text-gray-500">
                                        {mode === 'students'
                                            ? 'Select a course and date, then click Load Students'
                                            : 'Select a date, then click Load Teachers'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ===================== SUMMARY TAB ===================== */}
                    {tab === 'summary' && (
                        <>
                            {loadingSummary ? (
                                <div className="py-12"><LoadingSpinner /></div>
                            ) : (mode === 'students' ? studentSummary : teacherSummary).length > 0 ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="card overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
                                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 w-12">#</th>
                                                        {mode === 'students' && <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student ID</th>}
                                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                                        {mode === 'teachers' && <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Subject</th>}
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Total Days</th>
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Present</th>
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Absent</th>
                                                        <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Attendance %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(mode === 'students' ? studentSummary : teacherSummary).map((s, i) => (
                                                        <tr key={s._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-card/50">
                                                            <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                                                            {mode === 'students' && <td className="py-3 px-4 font-mono text-primary-700 dark:text-primary-400 font-medium text-xs">{s.studentId}</td>}
                                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                                            {mode === 'teachers' && <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{s.subject}</td>}
                                                            <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{s.totalDays}</td>
                                                            <td className="py-3 px-4 text-center"><span className="text-green-600 font-semibold">{s.presentDays}</span></td>
                                                            <td className="py-3 px-4 text-center"><span className="text-red-600 font-semibold">{s.absentDays}</span></td>
                                                            <td className="py-3 px-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-dark-border overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${s.percentage >= 75 ? 'bg-green-500' : s.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                            style={{ width: `${s.percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className={`text-xs font-bold ${s.percentage >= 75 ? 'text-green-600' : s.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                        {s.percentage}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="card text-center py-12">
                                    <div className="text-4xl mb-3">📊</div>
                                    <p className="text-gray-500">
                                        {mode === 'students'
                                            ? 'Select a course and optionally a date range, then click View Summary'
                                            : 'Optionally set a date range, then click View Summary'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManageAttendance;
