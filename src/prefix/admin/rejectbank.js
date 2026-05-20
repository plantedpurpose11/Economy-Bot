const { MessageEmbed } = require('discord.js');
const BankAccount = require('../../Schemas.js/bankSchema');
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const config = require('../../../config.json');

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null;
}

const adminIDs = config.adminIds;

module.exports = {
  name: 'rejectbank',
  description: 'Reject a bank account!',
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    if (!adminIDs.includes(message.author.id)) {
      return message.reply('Only administrators can use this command.');
    }

    const userId = args[0] || message.mentions.users.first()?.id;
    const reason = args.slice(1).join(' ');

    if (!userId || !reason) {
      return message.reply('Please provide a valid user ID and a reason for rejection.');
    }

    try {
      const userBankAccount = await BankAccount.findOneAndDelete({ userId });

      if (!userBankAccount) {
        return message.reply('User does not submit a bank account.');
      }

      const user = await client.users.fetch(userId);
      if (user) {
        await user.send(`Your bank account submission has been rejected.\nReason: ${reason}\nYou can resubmit your account at any time.`);
      }

      return message.reply(`Bank account rejected for user ID: ${userId}.\nReason: ${reason}`);
    } catch (err) {
      console.error(err);
      return message.reply('An error occurred while processing your request.');
    }
  },
};
