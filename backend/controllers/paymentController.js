const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Admission = require('../models/Admission');
const generateReceipt = require('../utils/generateReceipt');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit Manual Payment (UPI/QR/Cash)
// @route   POST /api/payments/manual
exports.submitManualPayment = async (req, res) => {
    try {
        const { admissionId, amount, transactionId, paymentMethod } = req.body;

        const admission = await Admission.findById(admissionId);
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        let installmentNumber = null;
        if (admission.paymentPlan === 'Installment') {
            const nextInstallment = admission.installments.find(i => i.status === 'Pending');
            if (nextInstallment) {
                installmentNumber = nextInstallment.number;
            }
        }

        const payment = await Payment.create({
            admission: admissionId,
            user: req.user._id,
            amount,
            transactionId,
            paymentMethod: paymentMethod || 'Manual',
            status: 'pending_approval',
            installmentNumber
        });

        res.status(201).json({
            message: 'Payment submitted for verification',
            payment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve Payment (Admin)
// @route   PUT /api/payments/:id/approve
exports.approvePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.status === 'paid') {
            return res.status(400).json({ message: 'Already approved' });
        }

        payment.status = 'paid';
        await payment.save();

        const admission = await Admission.findById(payment.admission).populate('courseApplied', 'name fees');

        if (payment.installmentNumber) {
            const installment = admission.installments.find(i => i.number === payment.installmentNumber);
            if (installment) {
                installment.status = 'Paid';
                installment.paidAt = new Date();
                installment.paymentRef = payment._id;
            }
            const allPaid = admission.installments.every(i => i.status === 'Paid');
            admission.paymentStatus = allPaid ? 'Paid' : 'Partially Paid';
        } else {
            admission.paymentStatus = 'Paid';
        }
        await admission.save();

        // Receipt is generated on-the-fly via GET /api/payments/:id/receipt

        // Email
        try {
            await sendEmail({
                to: admission.email,
                subject: 'Payment Approved - Pretech',
                html: `<p>Payment of ₹${payment.amount} approved. Ref: ${payment.transactionId}</p>`
            });
        } catch (err) { }

        res.json({ message: 'Payment approved', payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject Payment (Admin)
// @route   PUT /api/payments/:id/reject
exports.rejectPayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status: 'failed' }, { new: true });
        res.json({ message: 'Payment rejected', payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify payment after Stripe redirect
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { sessionId, admissionId } = req.body;

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Update payment
            const payment = await Payment.findOneAndUpdate(
                { stripeSessionId: sessionId },
                {
                    stripePaymentIntentId: session.payment_intent,
                    status: 'paid'
                },
                { new: true }
            );

            // Update admission payment status
            const admission = await Admission.findById(admissionId).populate('courseApplied', 'name fees');

            if (session.metadata.installmentNumber) {
                const instNum = parseInt(session.metadata.installmentNumber);
                const installment = admission.installments.find(i => i.number === instNum);

                if (installment) {
                    installment.status = 'Paid';
                    installment.paidAt = new Date();
                    installment.paymentRef = payment._id;
                }

                // Check if all paid
                const allPaid = admission.installments.every(i => i.status === 'Paid');
                admission.paymentStatus = allPaid ? 'Paid' : 'Partially Paid';
            } else {
                admission.paymentStatus = 'Paid';
            }

            await admission.save();

            // Receipt is generated on-the-fly via GET /api/payments/:id/receipt

            // Send payment confirmation email
            try {
                await sendEmail({
                    to: admission.email,
                    subject: 'Payment Confirmation - Pretech Computer Education',
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1E40AF, #F97316); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Payment Successful!</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Thank you, ${admission.name}!</h2>
                <p>Your payment has been received successfully.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Amount:</strong> ₹${payment.amount.toLocaleString('en-IN')}</p>
                  <p><strong>Course:</strong> ${admission.courseApplied?.name}</p>
                  <p><strong>Student ID:</strong> ${admission.studentId}</p>
                  <p><strong>Status:</strong> ✅ Paid</p>
                </div>
                <p>You can download your receipt from your student dashboard.</p>
              </div>
            </div>
          `
                });
            } catch (emailError) {
                console.log('Payment email failed, continuing...');
            }

            res.json({
                message: 'Payment verified successfully',
                payment,
                receiptUrl: payment.receiptUrl
            });
        } else {
            // Update payment as failed
            await Payment.findOneAndUpdate(
                { stripeSessionId: sessionId },
                { status: 'failed' }
            );

            await Admission.findByIdAndUpdate(admissionId, { paymentStatus: 'Failed' });

            res.status(400).json({ message: 'Payment not completed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'admission',
                select: 'studentId name email courseApplied',
                populate: { path: 'courseApplied', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my payments (student)
// @route   GET /api/payments/me
exports.getMyPayments = async (req, res) => {
    try {
        // Find the student's admission first
        const Admission = require('../models/Admission');
        const admission = await Admission.findOne({ user: req.user._id });

        let payments = [];
        if (admission) {
            payments = await Payment.find({ admission: admission._id })
                .populate({
                    path: 'admission',
                    select: 'studentId name courseApplied',
                    populate: { path: 'courseApplied', select: 'name' }
                })
                .sort({ createdAt: -1 });
        }
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download receipt (generates on-the-fly, no filesystem needed)
// @route   GET /api/payments/:id/receipt
exports.downloadReceipt = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'admission',
                populate: { path: 'courseApplied', select: 'name' }
            });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Generate receipt as PDF buffer
        const pdfBuffer = await generateReceipt(payment, payment.admission);

        // Stream directly to browser
        const filename = `receipt-${payment.transactionId || payment._id}.pdf`;
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record a payment directly (Admin data-entry, no approval needed)
// @route   POST /api/payments/record
exports.recordPayment = async (req, res) => {
    try {
        const { admissionId, amount, paymentMethod, transactionId, notes, paymentDate } = req.body;

        if (!admissionId || !amount) {
            return res.status(400).json({ message: 'admissionId and amount are required' });
        }

        const admission = await Admission.findById(admissionId).populate('courseApplied', 'name fees');
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        // Create payment and mark immediately as paid
        const payment = await Payment.create({
            admission: admissionId,
            user: req.user._id,
            amount: Number(amount),
            transactionId: transactionId || '',
            paymentMethod: paymentMethod || 'Cash',
            status: 'paid',
            currency: 'INR',
            ...(paymentDate ? { createdAt: new Date(paymentDate) } : {})
        });

        // Re-calculate total paid across all paid payments for this admission
        const paidPayments = await Payment.find({ admission: admissionId, status: 'paid' });
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalFees = admission.finalFees || admission.courseApplied?.fees || 0;
        const balanceDue = Math.max(0, totalFees - totalPaid);

        // Update admission paymentStatus
        if (totalPaid === 0) {
            admission.paymentStatus = 'Pending';
        } else if (balanceDue <= 0) {
            admission.paymentStatus = 'Paid';
        } else {
            admission.paymentStatus = 'Partially Paid';
        }
        await admission.save();

        // Receipt is generated on-the-fly via GET /api/payments/:id/receipt

        res.status(201).json({
            message: 'Payment recorded successfully',
            payment,
            feeSummary: { totalFees, totalPaid, balanceDue, paymentStatus: admission.paymentStatus }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get fee summary for a student admission (Admin)
// @route   GET /api/payments/summary/:admissionId
exports.getFeeSummary = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.admissionId)
            .populate('courseApplied', 'name fees');
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        const paidPayments = await Payment.find({ admission: req.params.admissionId, status: 'paid' })
            .sort({ createdAt: -1 });
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const grossFees = admission.finalFees || admission.courseApplied?.fees || 0;
        const discount = admission.discount || 0;
        const totalFees = Math.max(0, grossFees - discount);
        const balanceDue = Math.max(0, totalFees - totalPaid);

        res.json({
            admission: {
                _id: admission._id,
                studentId: admission.studentId,
                name: admission.name,
                email: admission.email,
                mobile: admission.mobile,
                courseApplied: admission.courseApplied,
                paymentStatus: admission.paymentStatus,
                paymentPlan: admission.paymentPlan,
                installments: admission.installments || [],
                totalInstallments: admission.totalInstallments || 1,
            },
            feeSummary: { grossFees, discount, totalFees, totalPaid, balanceDue, paymentStatus: admission.paymentStatus },
            payments: paidPayments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply discount to a student's fees
// @route   PUT /api/payments/discount/:admissionId
exports.applyDiscount = async (req, res) => {
    try {
        const { discount } = req.body;
        if (discount === undefined || discount < 0) {
            return res.status(400).json({ message: 'Valid discount amount is required' });
        }

        const admission = await Admission.findById(req.params.admissionId)
            .populate('courseApplied', 'name fees');
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        const grossFees = admission.finalFees || admission.courseApplied?.fees || 0;
        if (discount > grossFees) {
            return res.status(400).json({ message: 'Discount cannot exceed total fees' });
        }

        admission.discount = Number(discount);
        await admission.save();

        // Recalculate
        const paidPayments = await Payment.find({ admission: admission._id, status: 'paid' });
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalFees = Math.max(0, grossFees - discount);
        const balanceDue = Math.max(0, totalFees - totalPaid);

        // Update payment status
        if (balanceDue === 0 && totalPaid > 0) {
            admission.paymentStatus = 'Paid';
        } else if (totalPaid > 0) {
            admission.paymentStatus = 'Partially Paid';
        }
        await admission.save();

        res.json({
            message: `Discount of ₹${discount} applied`,
            feeSummary: { grossFees, discount, totalFees, totalPaid, balanceDue, paymentStatus: admission.paymentStatus }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a single installment status (Admin)
// @route   PUT /api/payments/installment/:admissionId/:installmentNumber
exports.updateInstallmentStatus = async (req, res) => {
    try {
        const { admissionId, installmentNumber } = req.params;
        const { status } = req.body; // 'Paid' or 'Pending'

        if (!['Paid', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Paid or Pending' });
        }

        const admission = await Admission.findById(admissionId).populate('courseApplied', 'name fees');
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        const instNum = parseInt(installmentNumber);
        const installment = admission.installments.find(i => i.number === instNum);
        if (!installment) {
            return res.status(404).json({ message: `Installment #${instNum} not found` });
        }

        installment.status = status;
        installment.paidAt = status === 'Paid' ? new Date() : undefined;

        // Recalculate admission paymentStatus
        const allPaid = admission.installments.every(i => i.status === 'Paid');
        const anyPaid = admission.installments.some(i => i.status === 'Paid');
        admission.paymentStatus = allPaid ? 'Paid' : anyPaid ? 'Partially Paid' : 'Pending';

        await admission.save();

        // Return updated data
        const paidPayments = await Payment.find({ admission: admissionId, status: 'paid' }).sort({ createdAt: -1 });
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalFees = admission.finalFees || admission.courseApplied?.fees || 0;
        const balanceDue = Math.max(0, totalFees - totalPaid);

        res.json({
            message: `Installment #${instNum} updated to ${status}`,
            admission: {
                _id: admission._id,
                studentId: admission.studentId,
                name: admission.name,
                email: admission.email,
                mobile: admission.mobile,
                courseApplied: admission.courseApplied,
                paymentStatus: admission.paymentStatus,
                paymentPlan: admission.paymentPlan,
                installments: admission.installments,
                totalInstallments: admission.totalInstallments,
            },
            feeSummary: { totalFees, totalPaid, balanceDue, paymentStatus: admission.paymentStatus },
            payments: paidPayments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get fee overview stats (Admin) — count of fully paid, partially paid, pending, balance-free students
// @route   GET /api/payments/overview
exports.getFeeOverview = async (req, res) => {
    try {
        const admissions = await Admission.find({ approved: true }).populate('courseApplied', 'name fees');

        let fullyPaid = 0;
        let partiallyPaid = 0;
        let pending = 0;
        let totalStudents = admissions.length;
        let totalFeesAll = 0;
        let totalCollected = 0;
        let totalDue = 0;

        // Get all paid payments grouped by admission
        const paidPayments = await Payment.find({ status: 'paid' });
        const paymentsByAdmission = {};
        paidPayments.forEach(p => {
            const key = p.admission.toString();
            paymentsByAdmission[key] = (paymentsByAdmission[key] || 0) + p.amount;
        });

        admissions.forEach(adm => {
            const fees = adm.finalFees || adm.courseApplied?.fees || 0;
            const paid = paymentsByAdmission[adm._id.toString()] || 0;
            totalFeesAll += fees;
            totalCollected += paid;
            totalDue += Math.max(0, fees - paid);

            if (adm.paymentStatus === 'Paid') fullyPaid++;
            else if (adm.paymentStatus === 'Partially Paid') partiallyPaid++;
            else pending++;
        });

        res.json({
            totalStudents,
            fullyPaid,
            partiallyPaid,
            pending,
            totalFeesAll,
            totalCollected,
            totalDue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
