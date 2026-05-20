const { MessageEmbed, EmbedBuilder } = require('discord.js');
const BankAccount = require('../../Schemas.js/bankSchema');
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const emojis = require("../../../emojis.json");

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: 'bank',
  description: 'View bank details!',
  run: async (client, message) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    try {
      const userBankAccount = await BankAccount.findOne({ userId: message.author.id });

      if (!userBankAccount) {
        return message.reply('You do not have a bank account yet.');
      }

      if (!userBankAccount.approved) {
        return message.reply('Your bank account is pending approval.');
      }

      const formattedBankBalance = userBankAccount.bankBalance.toLocaleString(); // Format balance

      const bankDetailsEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Bank Account Details')
        .setTimestamp()
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: "Don't share your pin code." ,iconURL: message.author.displayAvatarURL() })
        .addFields(
          { name: `${emojis.bankBriefcase} : Account Name`, value: `> **${userBankAccount.accountName}**` },
          { name: `${emojis.bankName} : Account Number`, value: `> **${userBankAccount.accountNumber}**` },
          { name: `${emojis.currencyEmoji} : Bank Balance`, value: `> **${formattedBankBalance}**` }
        );

      return message.channel.send({ embeds: [bankDetailsEmbed] });
    } catch (err) {
      console.error(err);
      return message.reply('An error occurred while fetching your bank details.');
    }
  },
};
