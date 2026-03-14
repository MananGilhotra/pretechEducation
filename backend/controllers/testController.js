const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');
const Admission = require('../models/Admission');
const Teacher = require('../models/Teacher');

// ======================== ADMIN ========================

// @desc    Create a new test
// @route   POST /api/tests
// @access  Admin
exports.createTest = async (req, res) => {
    try {
        const { title, description, course, batches, forTeachers, questions, duration, status } = req.body;

        const test = await Test.create({
            title,
            description,
            course,
            batches: Array.isArray(batches) ? batches : [batches],
            forTeachers: forTeachers || false,
            questions: questions || [],
            duration: Number(duration) || 0,
            status: status || 'Draft',
            createdBy: req.user._id
        });

        const populated = await Test.findById(test._id).populate('course', 'name');
        res.status(201).json({ message: 'Test created successfully', test: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tests
// @route   GET /api/tests
// @access  Admin
exports.getTests = async (req, res) => {
    try {
        const { course, status } = req.query;
        const filter = {};
        if (course) filter.course = course;
        if (status) filter.status = status;

        const tests = await Test.find(filter)
            .populate('course', 'name')
            .select('-questions.options.isCorrect') // don't leak answers in list
            .sort({ createdAt: -1 });

        // Add submission count for each test
        const testsWithStats = await Promise.all(tests.map(async (test) => {
            const submissionCount = await TestSubmission.countDocuments({ test: test._id });
            return { ...test.toObject(), submissionCount };
        }));

        res.json(testsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single test (with answers for admin)
// @route   GET /api/tests/:id
// @access  Admin
exports.getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('course', 'name');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Admin
exports.updateTest = async (req, res) => {
    try {
        let test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        const { title, description, course, batches, forTeachers, questions, duration, status } = req.body;

        if (title !== undefined) test.title = title;
        if (description !== undefined) test.description = description;
        if (course !== undefined) test.course = course;
        if (batches !== undefined) test.batches = Array.isArray(batches) ? batches : [batches];
        if (forTeachers !== undefined) test.forTeachers = forTeachers;
        if (questions !== undefined) test.questions = questions;
        if (duration !== undefined) test.duration = Number(duration) || 0;
        if (status !== undefined) test.status = status;

        await test.save(); // triggers pre-save hook for totalMarks
        const populated = await Test.findById(test._id).populate('course', 'name');
        res.json({ message: 'Test updated', test: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete test and its submissions
// @route   DELETE /api/tests/:id
// @access  Admin
exports.deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        await TestSubmission.deleteMany({ test: test._id });
        await Test.findByIdAndDelete(req.params.id);

        res.json({ message: 'Test and submissions deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for a test
// @route   GET /api/tests/:id/submissions
// @access  Admin
exports.getTestSubmissions = async (req, res) => {
    try {
        const submissions = await TestSubmission.find({ test: req.params.id })
            .sort({ submittedAt: -1 });

        // Populate submitter info
        const enriched = await Promise.all(submissions.map(async (sub) => {
            const obj = sub.toObject();
            if (sub.submitterType === 'student') {
                const admission = await Admission.findById(sub.submitterId).select('name studentId');
                obj.submitterName = admission?.name || 'Unknown';
                obj.submitterStudentId = admission?.studentId || '';
            } else {
                const teacher = await Teacher.findById(sub.submitterId).select('name subject');
                obj.submitterName = teacher?.name || 'Unknown';
                obj.submitterSubject = teacher?.subject || '';
            }
            return obj;
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset (delete) a submission so student/teacher can retake
// @route   DELETE /api/tests/:id/submissions/:submissionId
// @access  Admin
exports.resetSubmission = async (req, res) => {
    try {
        const submission = await TestSubmission.findOneAndDelete({
            _id: req.params.submissionId,
            test: req.params.id
        });
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.json({ message: 'Submission reset successfully. The student/teacher can now retake the test.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk import questions from structured text
// @route   POST /api/tests/:id/import
// @access  Admin
exports.bulkImportQuestions = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text content is required' });

        // Parse format:
        // Q: Question text
        // A: Option A
        // B: Option B
        // C: Option C
        // D: Option D
        // Ans: A
        // (blank line separator)

        const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
        const importedQuestions = [];

        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
            const qLine = lines.find(l => /^Q[:\.]?\s*/i.test(l));
            const optA = lines.find(l => /^A[:\.)]\s*/i.test(l));
            const optB = lines.find(l => /^B[:\.)]\s*/i.test(l));
            const optC = lines.find(l => /^C[:\.)]\s*/i.test(l));
            const optD = lines.find(l => /^D[:\.)]\s*/i.test(l));
            const ansLine = lines.find(l => /^Ans[:\.)]\s*/i.test(l));

            if (!qLine || !optA || !optB) continue; // need at least question + 2 options

            const questionText = qLine.replace(/^Q[:\.]?\s*/i, '').trim();
            const correctAns = ansLine ? ansLine.replace(/^Ans[:\.)]\s*/i, '').trim().toUpperCase() : '';

            const options = [];
            const optTexts = [
                { label: 'A', line: optA },
                { label: 'B', line: optB },
                { label: 'C', line: optC },
                { label: 'D', line: optD },
            ];

            for (const opt of optTexts) {
                if (opt.line) {
                    options.push({
                        text: opt.line.replace(/^[A-D][:\.)]\s*/i, '').trim(),
                        isCorrect: correctAns === opt.label
                    });
                }
            }

            if (options.length >= 2) {
                importedQuestions.push({
                    questionText,
                    questionImage: '',
                    options,
                    marks: 1
                });
            }
        }

        test.questions.push(...importedQuestions);
        await test.save();

        res.json({
            message: `${importedQuestions.length} questions imported successfully`,
            totalQuestions: test.questions.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ======================== STUDENT / TEACHER ========================

// @desc    Get my available tests (published, for my batch)
// @route   GET /api/tests/me
// @access  Student / Teacher (authenticated)
exports.getMyTests = async (req, res) => {
    try {
        const user = req.user;

        if (user.role === 'student') {
            const admission = await Admission.findOne({ user: user._id });
            if (!admission) return res.json([]);

            const tests = await Test.find({
                status: 'Published',
                course: admission.courseApplied,
                batches: admission.batchTiming
            })
                .populate('course', 'name')
                .select('-questions.options.isCorrect')
                .sort({ createdAt: -1 });

            // Check which tests student has already taken
            const testIds = tests.map(t => t._id);
            const submissions = await TestSubmission.find({
                test: { $in: testIds },
                submitterType: 'student',
                submitterId: admission._id
            }).select('test score totalMarks percentage');

            const submissionMap = {};
            submissions.forEach(s => { submissionMap[s.test.toString()] = s; });

            const enriched = tests.map(t => ({
                ...t.toObject(),
                questionCount: t.questions?.length || 0,
                questions: undefined, // remove questions from list
                submission: submissionMap[t._id.toString()] || null
            }));

            return res.json(enriched);
        }

        if (user.role === 'teacher') {
            const teacher = await Teacher.findOne({ user: user._id });
            if (!teacher) return res.json([]);

            const tests = await Test.find({
                status: 'Published',
                forTeachers: true
            })
                .populate('course', 'name')
                .select('-questions.options.isCorrect')
                .sort({ createdAt: -1 });

            const testIds = tests.map(t => t._id);
            const submissions = await TestSubmission.find({
                test: { $in: testIds },
                submitterType: 'teacher',
                submitterId: teacher._id
            }).select('test score totalMarks percentage');

            const submissionMap = {};
            submissions.forEach(s => { submissionMap[s.test.toString()] = s; });

            const enriched = tests.map(t => ({
                ...t.toObject(),
                questionCount: t.questions?.length || 0,
                questions: undefined,
                submission: submissionMap[t._id.toString()] || null
            }));

            return res.json(enriched);
        }

        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get test for attempting (without correct answers)
// @route   GET /api/tests/:id/attempt
// @access  Student / Teacher
exports.getTestForAttempt = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('course', 'name');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        if (test.status !== 'Published') return res.status(400).json({ message: 'This test is not available' });

        const user = req.user;

        // Check if already submitted
        let submitterId;
        let submitterType;
        if (user.role === 'student') {
            const admission = await Admission.findOne({ user: user._id });
            if (!admission) return res.status(403).json({ message: 'No admission found' });
            // Check batch eligibility
            if (String(admission.courseApplied) !== String(test.course._id) || !test.batches.includes(admission.batchTiming)) {
                return res.status(403).json({ message: 'You are not eligible for this test' });
            }
            submitterId = admission._id;
            submitterType = 'student';
        } else if (user.role === 'teacher') {
            if (!test.forTeachers) return res.status(403).json({ message: 'This test is not available for teachers' });
            const teacher = await Teacher.findOne({ user: user._id });
            if (!teacher) return res.status(403).json({ message: 'No teacher profile found' });
            submitterId = teacher._id;
            submitterType = 'teacher';
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const existing = await TestSubmission.findOne({ test: test._id, submitterType, submitterId });
        if (existing) return res.status(400).json({ message: 'You have already submitted this test', submission: existing });

        // Strip correct answers
        const sanitized = test.toObject();
        sanitized.questions = sanitized.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({ text: o.text }))
        }));

        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit test
// @route   POST /api/tests/:id/submit
// @access  Student / Teacher
exports.submitTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });
        if (test.status !== 'Published') return res.status(400).json({ message: 'This test is not available' });

        const user = req.user;
        const { answers } = req.body; // [{ questionIndex, selectedOption }]

        let submitterId, submitterType;
        if (user.role === 'student') {
            const admission = await Admission.findOne({ user: user._id });
            if (!admission) return res.status(403).json({ message: 'No admission found' });
            submitterId = admission._id;
            submitterType = 'student';
        } else if (user.role === 'teacher') {
            const teacher = await Teacher.findOne({ user: user._id });
            if (!teacher) return res.status(403).json({ message: 'No teacher profile found' });
            submitterId = teacher._id;
            submitterType = 'teacher';
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Check if already submitted
        const existing = await TestSubmission.findOne({ test: test._id, submitterType, submitterId });
        if (existing) return res.status(400).json({ message: 'You have already submitted this test' });

        // Auto-grade
        let score = 0;
        const totalMarks = test.totalMarks;
        const gradedAnswers = (answers || []).map(ans => {
            const question = test.questions[ans.questionIndex];
            if (question && ans.selectedOption >= 0 && ans.selectedOption < question.options.length) {
                if (question.options[ans.selectedOption].isCorrect) {
                    score += question.marks || 1;
                }
            }
            return { questionIndex: ans.questionIndex, selectedOption: ans.selectedOption };
        });

        const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 1000) / 10 : 0;

        const submission = await TestSubmission.create({
            test: test._id,
            submitterType,
            submitterId,
            answers: gradedAnswers,
            score,
            totalMarks,
            percentage,
            submittedAt: new Date()
        });

        res.status(201).json({
            message: 'Test submitted successfully',
            submission
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted this test' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my result for a test
// @route   GET /api/tests/:id/my-result
// @access  Student / Teacher
exports.getMySubmission = async (req, res) => {
    try {
        const user = req.user;
        let submitterId, submitterType;

        if (user.role === 'student') {
            const admission = await Admission.findOne({ user: user._id });
            if (!admission) return res.status(404).json({ message: 'No admission found' });
            submitterId = admission._id;
            submitterType = 'student';
        } else if (user.role === 'teacher') {
            const teacher = await Teacher.findOne({ user: user._id });
            if (!teacher) return res.status(404).json({ message: 'No teacher profile found' });
            submitterId = teacher._id;
            submitterType = 'teacher';
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const submission = await TestSubmission.findOne({
            test: req.params.id,
            submitterType,
            submitterId
        });

        if (!submission) return res.status(404).json({ message: 'No submission found' });

        // Get test with correct answers for review
        const test = await Test.findById(req.params.id).populate('course', 'name');

        res.json({ submission, test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
