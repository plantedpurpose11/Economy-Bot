const mongoose = require('mongoose');

// Create a schema for the bank accounts
const BankAccountSchema = new mongoose.Schema({
  username: String,
  accountName: String,
  pinCode: String,
  userId: String, // Assuming you store user IDs
  bankBalance: { type: Number, default: 0 }, // Bank balance with default value of 0
  accountNumber: String,
  approved: { type: Boolean, default: false }, // Approval status with default value of false
});

// Create a model based on the schema
const BankAccount = mongoose.model('BankAccount', BankAccountSchema);
module.exports = BankAccount;
