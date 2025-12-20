const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const verifyAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_radar');
        console.log('✅ MongoDB Connected');

        const testEmail = 'auth_test_' + Date.now() + '@example.com';
        const rawPassword = 'mySecretPassword123';

        // 1. Simulate Registration Hashing
        console.log('🔄 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // 2. Create User
        console.log('👤 Creating user with hashed password...');
        const newUser = await User.create({
            id: 'auth-test-' + Date.now(),
            name: 'Auth Test User',
            phone: '0000000000',
            email: testEmail,
            password: hashedPassword,
            stallName: 'Auth Test Stall',
            specialty: 'Security',
            location: 'Cyber City'
        });

        // 3. Simulate Login / Verification
        console.log('🔐 Verifying password...');
        const user = await User.findOne({ email: testEmail });

        if (!user) {
            throw new Error('User not found!');
        }

        const isMatch = await bcrypt.compare(rawPassword, user.password);
        if (isMatch) {
            console.log('✅ Password Verified Successfully!');
        } else {
            console.error('❌ Password Verification Failed!');
            process.exit(1);
        }

        const isWrongMatch = await bcrypt.compare('wrongPassword', user.password);
        if (!isWrongMatch) {
            console.log('✅ Wrong Password correctly rejected.');
        } else {
            console.error('❌ Wrong Password accepted (Security Risk)!');
            process.exit(1);
        }

        // Cleanup
        await User.deleteOne({ _id: newUser._id });
        console.log('✅ Cleanup Done');

        process.exit(0);
    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
};

verifyAuth();
