const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    seedName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    plantTime: {
        type: Date,
        required: true,
    },
    harvested: {
        type: Boolean,
        default: false, // Set default value to false
    },
});

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;
