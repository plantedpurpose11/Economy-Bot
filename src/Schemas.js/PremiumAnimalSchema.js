const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    xp: {
        type: Number,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    attack: {
        type: Number,
        required: true,
    },
    health: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    emoji: {
        type: String, // Store emoji as a string, e.g., '🦁'
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
});

const PremiumAnimal = mongoose.model('PremiumAnimal', premiumSchema);

module.exports = PremiumAnimal;
