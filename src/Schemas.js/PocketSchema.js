const mongoose = require('mongoose');

const pocketSchema = new mongoose.Schema({
  userId: String,
  items: [{
    name: String,
    emoji: String,
    price: Number,
    quantity: Number,
  }],
});

module.exports = mongoose.model('Pocket', pocketSchema);
