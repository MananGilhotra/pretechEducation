const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Delete the broken admin@pretech.in entry
    await User.deleteOne({ email: 'admin@pretech.in' });
    console.log('Deleted broken admin@pretech.in');

    // Recreate using User.create (triggers pre-save hook for proper hashing)
    const admin = await User.create({
        name: 'Admin',
        email: 'admin@pretech.in',
        password: 'admin123',
        role: 'admin'
    });
    console.log('Created admin@pretech.in with _id:', admin._id);

    // Verify using select('+password') like the login controller does
    const verify = await User.findOne({ email: 'admin@pretech.in' }).select('+password');
    const match = await verify.matchPassword('admin123');
    console.log('Password verification:', match ? 'SUCCESS' : 'FAILED');

    process.exit(0);
})();
