const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminExists = await User.findOne({ email: 'admin@pretech.in' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        await User.create({
            name: 'Admin User',
            email: 'admin@pretech.in',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@pretech.in');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
