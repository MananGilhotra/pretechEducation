const Admission = require('../models/Admission');
const User = require('../models/User');
const generateStudentId = require('../utils/generateStudentId');
const sendEmail = require('../utils/sendEmail');

// Internal helper for admission creation
const createAdmissionInternal = async (req, res, isAdmin) => {
    try {
        const studentId = await generateStudentId();

        let admissionData = {
            ...req.body,
            studentId,
            passportPhoto: '',
            signature: ''
        };

        // Store uploaded images as base64 data URIs (works on Render)
        if (req.files?.passportPhoto?.[0]) {
            const f = req.files.passportPhoto[0];
            admissionData.passportPhoto = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
        }
        if (req.files?.signature?.[0]) {
            const f = req.files.signature[0];
            admissionData.signature = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
        }

        const Course = require('../models/Course');
        const course = await Course.findById(req.body.courseApplied);

        if (course) {
            // Calculate Final Fees
            const discount = isAdmin ? (Number(req.body.discount) || 0) : 0;
            const finalFees = Math.max(0, course.fees - discount);
            admissionData.finalFees = finalFees;
            admissionData.discount = discount;

            // Enforce restrictions for non-admin
            if (!isAdmin) {
                admissionData.paymentPlan = 'Full';
                admissionData.totalInstallments = 1;
                admissionData.installments = [];
            }

            // Calculate Installments if applicable
            if (admissionData.paymentPlan === 'Installment') {
                const count = parseInt(req.body.totalInstallments) || 2;
                const amountPerPart = Math.ceil(finalFees / count);
                const installments = [];
                for (let i = 1; i <= count; i++) {
                    installments.push({
                        number: i,
                        amount: amountPerPart,
                        status: 'Pending'
                    });
                }
                admissionData.installments = installments;
                admissionData.totalInstallments = count;
            }
        }

        const admission = await Admission.create(admissionData);

        // Create user account for the student (only if email provided)
        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (!existingUser) {
                const user = await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.mobile, // Default password is mobile number
                    role: 'student',
                    studentId
                });
                admission.user = user._id;
                await admission.save();
            } else {
                admission.user = existingUser._id;
                if (!existingUser.studentId) {
                    existingUser.studentId = studentId;
                    await existingUser.save();
                }
                await admission.save();
            }
        }

        // Auto-handle payment when admin marks as "Paid" (Cash/Offline)
        if (isAdmin && req.body.paymentStatus === 'Paid') {
            const Payment = require('../models/Payment');

            if (admission.paymentPlan === 'Installment' && admission.installments?.length > 0) {
                // Mark first installment as Paid
                const firstInstallment = admission.installments.find(i => i.number === 1);
                if (firstInstallment) {
                    firstInstallment.status = 'Paid';
                    firstInstallment.paidAt = new Date();

                    // Create a Payment record for the first installment amount (revenue tracking)
                    const payment = await Payment.create({
                        admission: admission._id,
                        user: admission.user,
                        amount: firstInstallment.amount,
                        paymentMethod: 'Cash',
                        status: 'paid',
                        transactionId: `ADM-${admission.studentId}-INST1`,
                        installmentNumber: 1,
                        currency: 'INR'
                    });

                    firstInstallment.paymentRef = payment._id;

                    // Set status to Partially Paid (only 1st installment paid)
                    const allPaid = admission.installments.every(i => i.status === 'Paid');
                    admission.paymentStatus = allPaid ? 'Paid' : 'Partially Paid';
                    await admission.save();
                }
            } else {
                // Full payment — create a Payment record for the full amount
                await Payment.create({
                    admission: admission._id,
                    user: admission.user,
                    amount: admission.finalFees || 0,
                    paymentMethod: 'Cash',
                    status: 'paid',
                    transactionId: `ADM-${admission.studentId}-FULL`,
                    currency: 'INR'
                });
                // paymentStatus already set to 'Paid' from form data
            }
        }

        // Send confirmation email
        try {
            await sendEmail({
                to: req.body.email,
                subject: 'Admission Confirmation - Pretech Computer Education',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1E40AF, #F97316); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Pretech Computer Education</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Welcome, ${req.body.name}!</h2>
              <p>Your admission has been successfully submitted.</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Student ID:</strong> ${studentId}</p>
                <p><strong>Course:</strong> ${req.body.courseApplied}</p>
                <p><strong>Batch:</strong> ${req.body.batchTiming}</p>
                <p><strong>Fees:</strong> ₹${admissionData.finalFees}</p>
              </div>
              <p>Please proceed with the payment to complete your admission.</p>
              <p style="color: #666; font-size: 12px;">Default login password is your mobile number. Please change it after first login.</p>
            </div>
          </div>
        `
            });
        } catch (emailError) {
            console.log('Email sending failed, continuing...');
        }

        const populatedAdmission = await Admission.findById(admission._id).populate('courseApplied', 'name fees');

        res.status(201).json({
            message: 'Admission submitted successfully',
            admission: populatedAdmission
        });
    } catch (error) {

        res.status(500).json({ message: error.message });
    }
};

// @desc    Create admission (Public)
// @route   POST /api/admissions
exports.createAdmission = async (req, res) => {
    await createAdmissionInternal(req, res, false);
};

// @desc    Create admission (Admin)
// @route   POST /api/admissions/admin
exports.createAdmissionAdmin = async (req, res) => {
    await createAdmissionInternal(req, res, true);
};

// @desc    Get all admissions (admin)
// @route   GET /api/admissions
exports.getAdmissions = async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = {};
        if (status) filter.paymentStatus = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const admissions = await Admission.find(filter)
            .populate('courseApplied', 'name fees')
            .sort({ createdAt: -1 });
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my admission (student)
// @route   GET /api/admissions/me
exports.getMyAdmission = async (req, res) => {
    try {
        const admission = await Admission.findOne({ user: req.user._id })
            .populate('courseApplied', 'name fees duration');
        if (!admission) {
            return res.status(404).json({ message: 'No admission found' });
        }
        res.json(admission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve admission (admin)
// @route   PUT /api/admissions/:id/approve
exports.approveAdmission = async (req, res) => {
    try {
        const admission = await Admission.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        ).populate('courseApplied', 'name fees');

        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        res.json({ message: 'Admission approved', admission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export admissions as CSV (admin)
// @route   GET /api/admissions/export
exports.exportAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find()
            .populate('courseApplied', 'name fees')
            .sort({ createdAt: -1 });

        const csvHeader = 'Student ID,Name,Email,Mobile,Course,Batch,Payment Status,Date\n';
        const csvRows = admissions.map(a =>
            `${a.studentId},${a.name},${a.email},${a.mobile},${a.courseApplied?.name || 'N/A'},${a.batchTiming},${a.paymentStatus},${new Date(a.createdAt).toLocaleDateString()}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=admissions.csv');
        res.send(csvHeader + csvRows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a non-approved admission
// @route   DELETE /api/admissions/:id
// @access  Admin
exports.deleteAdmission = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }
        if (admission.approved) {
            return res.status(400).json({ message: 'Cannot delete an approved admission' });
        }

        const Payment = require('../models/Payment');
        // Delete related payments
        await Payment.deleteMany({ admission: admission._id });
        // Delete related user account if exists
        if (admission.user) {
            await User.findByIdAndDelete(admission.user);
        }
        await Admission.findByIdAndDelete(req.params.id);

        res.json({ message: 'Admission deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
