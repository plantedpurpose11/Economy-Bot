const User = require('../../Schemas.js/userAccountCreation');
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const Security = require('../../Schemas.js/securitySchema');
const emojis = require('../../../emojis.json');

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

// Map to store user cooldowns
const cooldowns = new Map();

module.exports = {
  name: 'rob',
  description: 'Rob another user.',
  async run(client, message, args) {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id);
      const currentTime = Date.now();

      if (currentTime < expirationTime) {
        const timeLeft = expirationTime - currentTime;
        const hoursLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutesLeft = Math.floor((timeLeft / (1000 * 60)) % 60);
        const secondsLeft = Math.floor((timeLeft / 1000) % 60);

        return message.reply(`Please wait **${hoursLeft}** hours, **${minutesLeft}** minutes, and **${secondsLeft}** seconds before reusing the \`rob\` command.`);
      }
    }

    const targetUser = message.mentions.users.first();
    if (!message.mentions.users.size) {
      return message.reply('Please mention a user to rob.');
    }
    if (targetUser.id === "740117727322046538") {
      return message.reply("You can't rob **EcoPaL** Owner!")
    }
    if (message.mentions.users.first() === message.author) {
      return message.reply('You cannot rob yourself!');
    }

    const robberUser = await User.findOne({ userId: message.author.id });
    const targetAccount = await User.findOne({ userId: targetUser.id });

    if (!targetAccount) {
      return message.reply('The target user does not have an account.');
    }

    const targetBalance = targetAccount.balance;

    if (targetBalance <= 0) {
      return message.reply('The target user does not have enough balance to be robbed.');
    }

    const amountToRob = Math.floor(targetBalance * 0.1);

    if (amountToRob <= 0) {
      return message.reply('The target user does not have enough balance to be robbed.');
    }

    // Check if the targeted user has security
    const targetSecurity = await Security.findOne({ userId: targetUser.id });
    if (targetSecurity && targetSecurity.hasSecurity) {
      return message.reply('This user has security and cannot be robbed.');
    }

    robberUser.balance += amountToRob;
    targetAccount.balance -= amountToRob;

    await robberUser.save();
    await targetAccount.save();

    // Set cooldown for the user
    const cooldownTime = 2 * 60 * 60 * 1000; // 2 hours
    cooldowns.set(message.author.id, Date.now() + cooldownTime);

    return message.reply(`Successfully robbed **${amountToRob.toLocaleString()}** ${emojis.currencyEmoji} EP coins from **${targetUser.username}**.`);
  },
};
