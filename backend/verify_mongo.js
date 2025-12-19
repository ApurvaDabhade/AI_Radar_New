const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const verifyMigration = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_radar');
        console.log('✅ MongoDB Connected');

        // Test User Creation
        const testUser = await User.create({
            id: 'test-user-' + Date.now(),
            name: 'Test Vendor',
            phone: '9999999999',
            password: 'password',
            stallName: 'Test Stall',
            specialty: 'Testing'
        });
        console.log('✅ User Created:', testUser.name);

        // Test Post Creation
        const testPost = await Post.create({
            id: 'test-post-' + Date.now(),
            author: testUser.name,
            content: 'Hello MongoDB!'
        });
        console.log('✅ Post Created:', testPost.content);

        // Find Fetch
        const foundUser = await User.findOne({ phone: '9999999999' });
        console.log('✅ User Found:', foundUser ? 'Yes' : 'No');

        // Cleanup
        await User.deleteOne({ _id: testUser._id });
        await Post.deleteOne({ _id: testPost._id });
        console.log('✅ Cleanup Done');

        process.exit(0);
    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
};

verifyMigration();
