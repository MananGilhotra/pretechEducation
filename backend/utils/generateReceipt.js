const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper to convert number to words (Indian numbering system)
const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : 'Only';
    return str.trim();
};

const generateReceipt = async (paymentData, admissionData) => {
    return new Promise((resolve, reject) => {
        // A5 Landscape to match physical receipt shape
        const doc = new PDFDocument({ margin: 30, size: 'A5', layout: 'landscape' });
        const filename = `receipt-${paymentData.transactionId || paymentData._id || Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../uploads', filename);

        // Ensure uploads dir exists
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        const pageW = 595.28; // A5 landscape width
        const leftM = 30;
        const rightEdge = pageW - 30;
        const contentW = rightEdge - leftM;

        // ===================== ORANGE GRADIENT HEADER BAR =====================
        const gradientTop = 15;
        const gradientH = 75;
        // Simulate gradient with multiple thin rects
        for (let i = 0; i < gradientH; i++) {
            const ratio = i / gradientH;
            const r = Math.round(255 * (1 - ratio * 0.2));
            const g = Math.round(165 + (100 - 165) * ratio);
            const b = Math.round(0 + 50 * ratio);
            doc.rect(leftM, gradientTop + i, contentW, 1)
                .fill(`rgb(${r}, ${g}, ${b})`);
        }

        // Header text on gradient
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#333');
        doc.text('ITGK CODE: 14290099', leftM + 8, gradientTop + 8);
        doc.text('Reco. By RKCL (Govt. of Raj.)', rightEdge - 160, gradientTop + 8);

        // Institute Name
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#0000AA');
        doc.text('Pretech', 0, gradientTop + 18, { width: pageW, align: 'center' });

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#003388');
        doc.text('Computer Education', 0, gradientTop + 42, { width: pageW, align: 'center' });

        doc.font('Helvetica').fontSize(7).fillColor('#333');
        doc.text('Under Pretech Shikshan Prashikshan Sansthan', 0, gradientTop + 56, { width: pageW, align: 'center' });

        doc.font('Helvetica').fontSize(6.5).fillColor('#444');
        doc.text('B-53 M.P. Nagar, Bikaner  •  Ph. 0151-3560631, Mob. 94142-33105, 8114499452', 0, gradientTop + 65, { width: pageW, align: 'center' });

        // ===================== REG NO / RECEIPT NO / COURSE / BATCH =====================
        let y = gradientTop + gradientH + 12;

        doc.font('Helvetica').fontSize(8).fillColor('#333');
        doc.text('Reg. No.: 260/BKN/2009-10', leftM + 5, y);

        // Receipt No (right side)
        const receiptNo = paymentData.transactionId || paymentData._id?.toString().slice(-6).toUpperCase() || '---';
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
        doc.text(`Receipt No.: `, rightEdge - 180, y, { continued: true });
        doc.fillColor('#CC0000').text(receiptNo);

        y += 16;
        const courseName = admissionData.courseApplied?.name || 'N/A';
        doc.font('Helvetica').fontSize(8).fillColor('#333');
        doc.text(`Course: `, leftM + 5, y, { continued: true });
        doc.font('Helvetica-Bold').fillColor('#000').text(courseName);

        // Batch
        const batchStr = admissionData.batchTiming || 'N/A';
        doc.font('Helvetica').fontSize(8).fillColor('#333');
        doc.text(`Batch: `, rightEdge - 180, y, { continued: true });
        doc.font('Helvetica-Bold').fillColor('#000').text(batchStr);

        // ===================== DIVIDER =====================
        y += 18;
        doc.moveTo(leftM, y).lineTo(rightEdge, y).lineWidth(1.5).strokeColor('#E67E00').stroke();
        y += 10;

        // ===================== RECEIVED FROM =====================
        const drawUnderlinedField = (label, value, x, fieldY, valueWidth = 180) => {
            doc.font('Helvetica').fontSize(9).fillColor('#333');
            doc.text(label, x, fieldY);
            const labelW = doc.widthOfString(label);
            const valX = x + labelW + 4;
            // Underline
            doc.moveTo(valX, fieldY + 12).lineTo(valX + valueWidth - labelW, fieldY + 12).lineWidth(0.5).strokeColor('#999').stroke();
            // Value
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
            doc.text(value || '', valX + 2, fieldY - 1, { width: valueWidth - labelW - 5 });
        };

        drawUnderlinedField('RECEIVED With Thanks From Mr./Mrs./Miss', admissionData.name || '', leftM + 5, y, contentW * 0.55);
        y += 22;

        // Father's Name
        drawUnderlinedField("Father's Name", admissionData.fatherHusbandName || '', leftM + 5, y, contentW * 0.55);
        y += 22;

        // The sum of Rupees
        const amountWords = numberToWords(paymentData.amount || 0);
        drawUnderlinedField('The sum of Rupees', `${amountWords} (₹${(paymentData.amount || 0).toLocaleString('en-IN')}/-)`, leftM + 5, y, contentW * 0.75);
        y += 26;

        // ===================== PAYMENT METHOD CHECKBOXES =====================
        const checkSize = 10;
        const isCash = ['Cash'].includes(paymentData.paymentMethod);
        const isOnline = ['UPI', 'Online', 'Bank Transfer', 'Cheque', 'Other', 'Manual'].includes(paymentData.paymentMethod);

        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text('By Cash', leftM + 5, y + 1);
        const cashBoxX = leftM + 50;
        doc.rect(cashBoxX, y - 1, checkSize, checkSize).lineWidth(1).strokeColor('#333').stroke();
        if (isCash) {
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
            doc.text('✓', cashBoxX + 1, y - 2);
        }

        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text('By Online', leftM + 80, y + 1);
        const onlineBoxX = leftM + 130;
        doc.rect(onlineBoxX, y - 1, checkSize, checkSize).lineWidth(1).strokeColor('#333').stroke();
        if (isOnline) {
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
            doc.text('✓', onlineBoxX + 1, y - 2);
        }

        // Payment method detail
        if (isOnline && paymentData.paymentMethod !== 'Online') {
            doc.font('Helvetica').fontSize(8).fillColor('#555');
            doc.text(`(${paymentData.paymentMethod})`, leftM + 148, y + 1);
        }

        // Towards label
        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text('Towards: Course Fee', rightEdge - 180, y + 1);

        y += 22;

        // ===================== DATE LINE =====================
        const payDate = new Date(paymentData.createdAt || Date.now());
        const day = payDate.getDate();
        const month = payDate.getMonth() + 1;
        const year = payDate.getFullYear() % 100; // 2-digit year

        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text('Dated', leftM + 5, y + 1);

        // Day box
        doc.text('Day', leftM + 45, y + 1);
        doc.rect(leftM + 65, y - 2, 30, 14).lineWidth(0.5).strokeColor('#999').stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(String(day), leftM + 70, y);

        // Month box
        doc.font('Helvetica').fontSize(9).fillColor('#333').text('Month', leftM + 105, y + 1);
        doc.rect(leftM + 135, y - 2, 30, 14).lineWidth(0.5).strokeColor('#999').stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(String(month), leftM + 140, y);

        // Year box
        doc.font('Helvetica').fontSize(9).fillColor('#333').text('Year', leftM + 180, y + 1);
        doc.rect(leftM + 200, y - 2, 30, 14).lineWidth(0.5).strokeColor('#999').stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(String(year), leftM + 205, y);

        y += 22;

        // ===================== FEES TABLE =====================
        const col1X = leftM + 5;
        const col2X = leftM + 120;
        const boxW = 100;
        const boxH = 16;

        const drawFeeRow = (label, value, rowY) => {
            doc.font('Helvetica').fontSize(9).fillColor('#333').text(label, col1X, rowY + 2);
            doc.rect(col2X, rowY - 1, boxW, boxH).lineWidth(0.5).strokeColor('#999').stroke();
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(value, col2X + 5, rowY + 2);
        };

        // Total Fees
        drawFeeRow('Total Fees', `₹${(admissionData.finalFees || 0).toLocaleString('en-IN')}/-`, y);

        // Installment label on right
        let installmentText = 'NIL';
        if (paymentData.installmentNumber) {
            const roman = ['I', 'II', 'III', 'IV'][paymentData.installmentNumber - 1] || paymentData.installmentNumber;
            installmentText = roman;
        }
        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text('Installment (I, II, III)', rightEdge - 200, y + 2, { continued: true });
        doc.font('Helvetica-Bold').fillColor('#000').text(`  ${installmentText}`);

        y += boxH + 6;

        // Deposit Fee (amount paid now)
        drawFeeRow('Deposit Fee', `₹${(paymentData.amount || 0).toLocaleString('en-IN')}/-`, y);

        y += boxH + 6;

        // Balance calculation
        let balance = 0;
        if (admissionData.finalFees) {
            // Estimate total paid: sum of all paid installments or just this payment if full
            const paidFromInstallments = admissionData.installments?.reduce((sum, inst) =>
                (inst.status === 'Paid' ? sum + inst.amount : sum), 0) || 0;
            balance = Math.max(0, admissionData.finalFees - Math.max(paidFromInstallments, paymentData.amount));
        }

        drawFeeRow('Balance', balance === 0 ? 'NIL' : `₹${balance.toLocaleString('en-IN')}/-`, y);

        // Total Amount on right side
        doc.font('Helvetica').fontSize(9).fillColor('#333');
        doc.text('Total Amount', rightEdge - 200, y + 2);
        doc.rect(rightEdge - 120, y - 1, boxW, boxH).lineWidth(0.5).strokeColor('#999').stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
        doc.text(`₹${(paymentData.amount || 0).toLocaleString('en-IN')}/-`, rightEdge - 115, y + 2);

        y += boxH + 20;

        // ===================== FOOTER =====================
        // Signature line
        doc.moveTo(rightEdge - 160, y).lineTo(rightEdge - 20, y).lineWidth(0.5).strokeColor('#333').stroke();
        doc.font('Helvetica').fontSize(8).fillColor('#333');
        doc.text('Authorised Sign.', rightEdge - 120, y + 4);

        // Fee policy
        doc.font('Helvetica-Oblique').fontSize(7).fillColor('#666');
        doc.text('Fee once deposited cannot be returned at any cost.', leftM + 5, y + 4);

        // ===================== BORDER =====================
        doc.rect(leftM - 5, 10, contentW + 10, y + 20).lineWidth(1.5).strokeColor('#E67E00').stroke();

        doc.end();

        stream.on('finish', () => {
            resolve({ filename, filepath });
        });

        stream.on('error', reject);
    });
};

module.exports = generateReceipt;
