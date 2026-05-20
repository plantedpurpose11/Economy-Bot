
const User = require('../../Schemas.js/userAccountCreation');
const Bank = require('../../Schemas.js/bankSchema');
const Blacklist = require('../../Schemas.js/BlacklistSchema');

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: 'deposit',
  description: 'Deposit coins to your bank account',
  aliases: ['dep'],
  usage: 'deposit <amount>',
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    // Fetch user's account and bank data from the database
    const userAccount = await User.findOne({ userId: message.author.id });
    const bankAccount = await Bank.findOne({ userId: message.author.id });

    if (!userAccount || !bankAccount) {
      return message.reply("You don't have an account or bank account yet!");
    }

    if (!bankAccount.approved) {
      return message.reply('Your bank account is pending approval.');
    }

    let amount = 0;

    if (args[0] && args[0].toLowerCase() === 'all') {
      amount = userAccount.balance;
    } else {
      amount = parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) {
        return message.reply('Please provide a valid amount to deposit or type `deposit all` to deposit all your coins.');
      }
    }

    if (userAccount.balance < amount) {
      return message.reply('You do not have enough coins to deposit.');
    }

    // Deduct coins from the user's balance and update the bank balance
    userAccount.balance -= amount;
    bankAccount.bankBalance += amount;

    // Save updated balances to the database
    await userAccount.save();
    await bankAccount.save();

    return message.reply(`Successfully deposited **${amount.toLocaleString()}** coins to your bank account.`);
  },
};
