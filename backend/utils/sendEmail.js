const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        // Skip email if credentials are not configured
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com' ||
            !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password') {
            console.log('Email skipped: credentials not configured');
            return null;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            connectionTimeout: 5000, // 5 second timeout
            greetingTimeout: 5000,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Pretech Computer Education" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email error:', error.message);
        // Don't throw - email failure shouldn't break the flow
        return null;
    }
};

module.exports = sendEmail;
