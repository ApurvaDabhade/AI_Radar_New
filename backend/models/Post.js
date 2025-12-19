const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    id: String,
    author: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    type: { type: String, default: 'update' },
    comments: [commentSchema],
    replies: { type: Number, default: 0 }
});

module.exports = mongoose.model('Post', postSchema);
