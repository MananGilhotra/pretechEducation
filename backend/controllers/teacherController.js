const Teacher = require('../models/Teacher');
const Salary = require('../models/Salary');
const User = require('../models/User');

// @desc    Add a new teacher
// @route   POST /api/teachers
exports.addTeacher = async (req, res) => {
    try {
        const teacherData = { ...req.body };

        // Create user account if email provided
        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (!existingUser) {
                const user = await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.teacherPassword || req.body.phone,
                    role: 'teacher'
                });
                teacherData.user = user._id;
            } else {
                teacherData.user = existingUser._id;
                if (existingUser.role !== 'teacher') {
                    existingUser.role = 'teacher';
                    await existingUser.save();
                }
            }
        }

        const teacher = await Teacher.create(teacherData);
        res.status(201).json({ message: 'Teacher added successfully', teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teachers
// @route   GET /api/teachers
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().sort({ createdAt: -1 });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single teacher with salary history
// @route   GET /api/teachers/:id
exports.getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const salaries = await Salary.find({ teacher: teacher._id })
            .sort({ year: -1, month: -1 });

        const totalPaid = salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);

        res.json({ teacher, salaries, totalPaid });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        await Salary.deleteMany({ teacher: teacher._id });
        await Teacher.findByIdAndDelete(req.params.id);

        res.json({ message: 'Teacher and salary records deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record salary payment
// @route   POST /api/teachers/salary
exports.recordSalary = async (req, res) => {
    try {
        const { teacherId, amount, month, year, paymentMethod, transactionId, notes, paidAt } = req.body;

        if (!teacherId || !amount || !month || !year) {
            return res.status(400).json({ message: 'teacherId, amount, month, and year are required' });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // Check for duplicate
        const existing = await Salary.findOne({ teacher: teacherId, month, year });
        if (existing) {
            return res.status(400).json({ message: `Salary for ${month}/${year} already recorded for this teacher` });
        }

        const salary = await Salary.create({
            teacher: teacherId,
            amount: Number(amount),
            month: Number(month),
            year: Number(year),
            paymentMethod: paymentMethod || 'Cash',
            transactionId: transactionId || '',
            notes: notes || '',
            status: 'paid',
            paidAt: paidAt ? new Date(paidAt) : new Date()
        });

        res.status(201).json({ message: 'Salary recorded', salary });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Salary already recorded for this month/year' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get salary overview (for dashboard)
// @route   GET /api/teachers/salary-overview
exports.getSalaryOverview = async (req, res) => {
    try {
        const teachers = await Teacher.find({ status: 'Active' });
        const salaries = await Salary.find({ status: 'paid' });

        const totalTeachers = teachers.length;
        const totalSalaryPaid = salaries.reduce((sum, s) => sum + s.amount, 0);

        // This month's pending
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const paidThisMonth = salaries.filter(s => s.month === currentMonth && s.year === currentYear);
        const paidTeacherIds = paidThisMonth.map(s => s.teacher.toString());
        const pendingThisMonth = teachers.filter(t => !paidTeacherIds.includes(t._id.toString()));

        const totalMonthlySalary = teachers.reduce((sum, t) => sum + (t.monthlySalary || 0), 0);
        const paidThisMonthAmount = paidThisMonth.reduce((sum, s) => sum + s.amount, 0);

        // Monthly salary data (last 6 months)
        const monthlySalaryData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const monthSalaries = salaries.filter(s => s.month === m && s.year === y);
            const total = monthSalaries.reduce((sum, s) => sum + s.amount, 0);
            monthlySalaryData.push({
                month: `${y}-${String(m).padStart(2, '0')}`,
                amount: total,
                count: monthSalaries.length
            });
        }

        res.json({
            totalTeachers,
            totalSalaryPaid,
            totalMonthlySalary,
            paidThisMonthAmount,
            pendingThisMonth: pendingThisMonth.length,
            monthlySalaryData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my details (teacher portal)
// @route   GET /api/teachers/me
exports.getMyTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (!teacher) return res.status(404).json({ message: 'No teacher profile found' });

        const salaries = await Salary.find({ teacher: teacher._id })
            .sort({ year: -1, month: -1 });

        const totalPaid = salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);

        res.json({ teacher, salaries, totalPaid });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
