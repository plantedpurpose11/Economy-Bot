const mongoose = require('mongoose');

const HunterSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    cowoncyValue: {
        type: Number,
        default: 0
    },
    rarity: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    health: {
        type: Number,
        default: 100
    },
    attack: {
        type: Number,
        default: 10
    },
    image: {
        type: String
    }
});

const Hunter = mongoose.model('Hunter', HunterSchema);

module.exports = Hunter;
