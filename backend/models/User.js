const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Custom ID to maintain compatibility with frontend
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true }, // Sparse allows null/undefined to not conflict
    password: { type: String, required: true },
    stallName: { type: String, required: true },
    specialty: { type: String },
    location: { type: String },
    isVerified: { type: Boolean, default: false },
    menuItems: [{
        name: String,
        price: Number,
        category: String,
        description: String,
        image: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
