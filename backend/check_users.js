const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_radar');
        console.log('✅ MongoDB Connected');

        const count = await User.countDocuments();
        console.log(`📊 Current User Count: ${count}`);

        if (count === 0) {
            console.log('🌱 Database is empty. Seeding demo user...');
            await User.create({
                id: '1',
                name: 'Demo Vendor',
                phone: '1234567890',
                email: 'demo@example.com',
                password: 'password', // Plain text for demo simplicity or hashed if you prefer, but login endpoint checks hash
                stallName: 'Mumbai Masala',
                specialty: 'Street Food',
                location: 'Mumbai',
                menuItems: ['Vada Pav', 'Misal Pav', 'Tea'],
                isVerified: true
            });
            console.log('✅ Demo User Seeded');
        } else {
            console.log('✅ Users exist. No seeding needed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkAndSeed();
