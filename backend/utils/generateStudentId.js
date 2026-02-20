const Admission = require('../models/Admission');

const generateStudentId = async () => {
    const year = new Date().getFullYear();
    const prefix = `PRETECH-${year}-`;

    // Find the last admission of this year
    const lastAdmission = await Admission.findOne({
        studentId: { $regex: `^${prefix}` }
    }).sort({ studentId: -1 });

    let nextNumber = 1;
    if (lastAdmission) {
        const lastNumber = parseInt(lastAdmission.studentId.split('-')[2]);
        nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

module.exports = generateStudentId;
