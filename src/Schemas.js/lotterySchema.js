const mongoose = require('mongoose');

const lotterySchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});


// true - ’true’ for all resources downloaded through our platform
// 525030 - Downloader’s user ID
// EthicalProgrammer - Downloader’s username
// 50469 - Downloaded resource ID
// 164826 - Downloaded resource version
// 1735300806 - Download epoch timestamp
// 50846d932300aac67d67029e05f185db - A secondary unique hash representing the download *

const userLotteryEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  amountAdded: {
    type: Number,
    required: true,
  },
  chancesOfWinning: {
    type: Number,
    default: 0,
  },
});

const Lottery = mongoose.model('Lottery', lotterySchema);
const UserLotteryEntry = mongoose.model('UserLotteryEntry', userLotteryEntrySchema);

module.exports = {
  Lottery,
  UserLotteryEntry,
};
