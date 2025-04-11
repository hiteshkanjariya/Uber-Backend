const mongoose = require('mongoose');

const jwtBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '24h', // 24 hours in seconds
    },
});

const JWTBlacklist = mongoose.model('JWTBlacklist', jwtBlacklistSchema);

module.exports = JWTBlacklist;
