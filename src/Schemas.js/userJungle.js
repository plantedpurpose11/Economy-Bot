
const mongoose = require('mongoose');

const CommonAnimalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
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
        default: 0 // Default value for common animals' cowoncy
    },
    rarity: {
        type: String,
        default: 'common' // Default rarity for common animals
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
        default: 0 // Modify this default value as needed
    }
});

const CommonAnimal = mongoose.model('CommonAnimal', CommonAnimalSchema);

const RareAnimalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
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
        default: 0 // Default value for rare animals' cowoncy
    },
    rarity: {
        type: String,
        default: 'rare' // Default rarity for common animals
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
        default: 0 // Modify this default value as needed
    }
});

const RareAnimal = mongoose.model('RareAnimal', RareAnimalSchema);

const LegendaryAnimalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
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
        default: 0 // Default value for legendary animals' cowoncy
    },
    rarity: {
        type: String,
        default: 'legendary' // Default rarity for common animals
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
        default: 0 // Modify this default value as needed
    },
    image: {
        type: String, // Store image URL as string
        required: true // Assuming each legendary animal must have an image
    }
});

const LegendaryAnimal = mongoose.model('LegendaryAnimal', LegendaryAnimalSchema);

const PreimiumAnimalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
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
        default: 0 // Default value for common animals' cowoncy
    },
    rarity: {
        type: String,
        default: 'premium' // Default rarity for common animals
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
        default: 0 // Modify this default value as needed
    },
    image: {
        type: String, // Store image URL as string
        required: true // Assuming each legendary animal must have an image
    }
});

const PreimiumAnimal = mongoose.model('PreimiumAnimal', PreimiumAnimalSchema);

module.exports = { CommonAnimal, RareAnimal, LegendaryAnimal, PreimiumAnimal };
