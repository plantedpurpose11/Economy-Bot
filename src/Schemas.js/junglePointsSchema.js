// junglePointsSchema.js
const mongoose = require('mongoose');

const JunglePointsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('JunglePoints', JunglePointsSchema);
