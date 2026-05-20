const mongoose = require('mongoose');

const securitySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    hasSecurity: {
        type: Boolean,
        default: false,
    },
});

const Security = mongoose.model('Security', securitySchema);

module.exports = Security;
