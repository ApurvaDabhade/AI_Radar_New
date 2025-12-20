const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    expiryDate: { type: Date, required: true },
    category: { type: String, default: 'raw' },
    lowStockThreshold: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);
