const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_radar');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.log("⚠️ Remote MongoDB Connection Failed. Attempting Local Fallback...");
        try {
            const conn = await mongoose.connect('mongodb://127.0.0.1:27017/ai_radar');
            console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
        } catch (localError) {
            console.log("⚠️ Local MongoDB also failed. Server running without DB.");
            // process.exit(1); 
        }
    }
};

module.exports = connectDB;
