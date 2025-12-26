const mongoose = require('mongoose');
const IngredientPrice = require('../models/IngredientPrice');
require('dotenv').config({ path: '../.env' }); // Adjust path to .env if needed

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-radar');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const removeDuplicates = async () => {
    await connectDB();
    console.log("Checking for duplicates...");

    try {
        // Find all documents
        const allDocs = await IngredientPrice.find({}).sort({ date: -1 });
        const seen = new Set();
        const duplicates = [];

        for (const doc of allDocs) {
            // Normalize name to ensure case-insensitive check if needed, 
            // but strict name check is probably enough given our scheduler logic.
            const name = doc.name;
            if (seen.has(name)) {
                duplicates.push(doc._id);
            } else {
                seen.add(name);
            }
        }

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate entries. Removing...`);
            await IngredientPrice.deleteMany({ _id: { $in: duplicates } });
            console.log("Duplicates removed successfully.");
        } else {
            console.log("No duplicates found.");
        }

    } catch (error) {
        console.error("Error removing duplicates:", error);
    } finally {
        mongoose.disconnect();
    }
};

removeDuplicates();
