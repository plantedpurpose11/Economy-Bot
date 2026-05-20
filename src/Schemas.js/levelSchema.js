// levelSchema.js

const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  xp: {
    type: Number,
    // default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
});

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;
