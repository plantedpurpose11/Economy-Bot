const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  // You can add more fields if needed, such as the reason for blacklisting, duration, etc.
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema);

module.exports = Blacklist;
