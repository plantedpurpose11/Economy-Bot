const { MessageEmbed, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const BankAccount = require('../../Schemas.js/bankSchema');
const Blacklist = require('../../Schemas.js/BlacklistSchema');

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: 'openbank',
  description: 'Open a bank account!',
  run: async (client, message) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    try {
      const bankRulesEmbed = new EmbedBuilder()
  	  .setColor('#0099ff')
      .setTitle('Bank Account Rules')
     .setDescription('These are the rules for opening a bank account.')
     .addFields(
      { name: 'Rule 1', value: 'The pin code must be a 5-digit number.' },
      { name: 'Rule 2', value: 'Do not share your pin code with anyone else.' },
      { name: 'Rule 3', value: 'Keep a powerful pin code that is easy for you to remember.' },
      
  );

// You can continue adding more rules using the .addFields() method as needed

        // Add other rules as needed

      const userBankAccount = await BankAccount.findOne({ userId: message.author.id });

      if (!userBankAccount) {
        const createAccountButton = new ButtonBuilder()
          .setCustomId('openBank')
          .setLabel('Open Bank Account')
          .setStyle(ButtonStyle.Primary);

        const createAccountRow = new ActionRowBuilder().addComponents(createAccountButton);

        return message.reply({
          embeds: [bankRulesEmbed],
          components: [createAccountRow],
        });
      }

      if (userBankAccount.approved) {
        return message.reply('You already have an approved bank account.');
      }

      // If the account is pending (approved is false)
      const pendingAccountEmbed = new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle('Pending Bank Account')
        .setDescription('Your bank account is pending approval.');

      message.reply({
        embeds: [pendingAccountEmbed],
      });
    } catch (err) {
      console.error(err);
      return message.reply('An error occurred while processing your request.');
    }
  },
};
