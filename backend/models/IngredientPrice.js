const mongoose = require('mongoose');

const IngredientPriceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        default: '1kg'
    },
    marketPrice: {
        type: Number,
        required: true
    },
    bestPrice: { // The lowest price found online
        type: Number,
        required: true
    },
    platform: { // The platform offering the best price (e.g., 'Blinkit', 'Zepto')
        type: String,
        required: true
    },
    savings: {
        type: Number,
        default: 0
    },
    image: {
        type: String, // Emoji or URL
        default: '🥘'
    },
    date: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        default: 'System AI'
    }
});

module.exports = mongoose.model('IngredientPrice', IngredientPriceSchema);
