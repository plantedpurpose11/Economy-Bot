const User = require("../../Schemas.js/userAccountCreation"); 
const config = require('../../../config.json');
const emojis = require('../../../emojis.json');

module.exports = {
  name: 'removebal',
  description: 'Remove balance from a user',
  usage: `${config.prefix} removebal <userId> <amount/all>`,
  run: async (client, message, args) => {
    // Check admin permission
    if (!isAdminOrOwner(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    const [userId, amount] = args;

    // Validate input
    if (!userId || !amount) {
      return message.reply(
        `Invalid command usage. Format: \`${config.prefix} removebal <userId> <amount>\` or \`${config.prefix} removebal <userId> all\``
      );
    }

    try {
      const user = await User.findOne({ userId });

      if (!user) {
        return message.reply('User not found. Make sure they have created an account using the start command.');
      }

      const originalBalance = user.balance;

      if (amount.toLowerCase() === 'all') {
        user.balance = 0;
      } else {
        // Validate amount is a positive number
        const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return message.reply('Amount must be a positive number.');
        }

        // Check if amount exceeds balance
        if (parsedAmount > user.balance) {
          return message.reply(
            `The amount exceeds the user's balance. Current balance: **__${user.balance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins`
          );
        }

        user.balance -= parsedAmount;
      }

      await user.save();

      // Format response message
      let replyMessage;
      if (amount.toLowerCase() === 'all') {
        replyMessage = 
          `All balance (**__${originalBalance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins) removed from user **${user.userName}** (ID: ${userId}).\n` +
          `New balance: **__0__** ${emojis.currencyEmoji} EP coins`;
      } else {
        replyMessage = 
          `Balance of **__${parseInt(amount).toLocaleString()}__** ${emojis.currencyEmoji} EP coins removed from user **${user.userName}** (ID: ${userId}).\n` +
          `Original balance: **__${originalBalance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins\n` +
          `New balance: **__${user.balance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins`;
      }

      return message.reply(replyMessage);
    } catch (error) {
      console.error('Error in removebal command:', error);
      return message.reply('An error occurred while processing the command. Please try again.');
    }
  },
};

function isAdminOrOwner(userId) {
  const adminUserIds = config.adminIds; 
  return adminUserIds.includes(userId);
}
