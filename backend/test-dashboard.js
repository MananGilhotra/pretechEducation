const mongoose = require('mongoose');
require('dotenv').config();

const Admission = require('./models/Admission');
const Enquiry = require('./models/Enquiry');
const Payment = require('./models/Payment');
const Course = require('./models/Course');
const Teacher = require('./models/Teacher');
const Salary = require('./models/Salary');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        console.log('Testing admissions bypass');
        const admissionsByCourse = await Admission.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseApplied',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: '$course.name',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        console.log('Admissions by Course:', admissionsByCourse);

        console.log('Testing monthly revenue');
        const monthlyRevenue = await Payment.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('Monthly revenue:', monthlyRevenue);

        console.log('Testing monthly salary');
        const monthlySalary = await Salary.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    expenses: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('Monthly salary:', monthlySalary);

        console.log('Success!');
    } catch (e) {
        console.error('Error occurred:', e);
    }
    process.exit(0);
}
test();
