const User = require("../../Schemas.js/userAccountCreation"); 
const config = require('../../../config.json');
const emojis = require('../../../emojis.json');

module.exports = {
  name: 'addbal',
  description: 'Add balance to a user',
  usage: `${config.prefix} addbal <userId> <amount>`,
  run: async (client, message, args) => {
    // Check admin permission
    if (!isAdminOrOwner(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    const [userId, amount] = args;

    // Validate input
    if (!userId || !amount) {
      return message.reply(`Invalid command usage. Format: \`${config.prefix} addbal <userId> <amount>\``);
    }

    // Validate amount is a positive number
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return message.reply('Amount must be a positive number.');
    }

    try {
      const user = await User.findOne({ userId });

      if (!user) {
        return message.reply('User not found. Make sure they have created an account using the start command.');
      }

      // Add balance and save
      user.balance += parsedAmount;
      await user.save();

      return message.reply(
        `Balance of **__${parsedAmount.toLocaleString()}__** ${emojis.currencyEmoji} EP coins added to user **${user.userName}** (ID: ${userId}).\n` +
        `New balance: **__${user.balance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins`
      );
    } catch (error) {
      console.error('Error in addbal command:', error);
      return message.reply('An error occurred while processing the command. Please try again.');
    }
  },
};

function isAdminOrOwner(userId) {
  const adminUserIds = config.adminIds; 
  return adminUserIds.includes(userId);
}
