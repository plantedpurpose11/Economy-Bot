const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  userId: String,
  farmType: String, // Small, Medium, Large
  seedsCapacity: Number,
});

module.exports = mongoose.model('Farm', FarmSchema);
