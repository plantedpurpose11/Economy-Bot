const { MessageEmbed } = require('discord.js');
const BankAccount = require('../../Schemas.js/bankSchema');
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const config = require('../../../config.json');

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; 
}


const adminIDs = config.adminIds;

function generateAccountNumber() {
  const min = 100000000; 
  const max = 999999999; 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: 'approvebank',
  description: 'Approve a bank account!',
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    if (!adminIDs.includes(message.author.id)) {
      return message.reply('Only administrators can use this command.');
    }

    const userId = args[0] || message.mentions.users.first()?.id;

    if (!userId) {
      return message.reply('Please provide a valid user ID.');
    }

    try {
      const userBankAccount = await BankAccount.findOne({ userId });

      if (!userBankAccount) {
        return message.reply('User has not submitted a bank account.');
      }

      if (userBankAccount.approved) {
        return message.reply('User already has an approved bank account.');
      }

      userBankAccount.approved = true;
      userBankAccount.accountNumber = generateAccountNumber(); 
      await userBankAccount.save();

      const user = await client.users.fetch(userId);
      if (user) {
        await user.send(`Your bank account has been approved! Your account number is: ${userBankAccount.accountNumber}`);
      }

      return message.reply(`Bank account approved for user ID: ${userId}`);
    } catch (err) {
      console.error(err);
      return message.reply('An error occurred while processing your request.');
    }
  },
};
