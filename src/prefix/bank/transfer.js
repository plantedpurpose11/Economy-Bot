const { MessageActionRow, MessageButton, MessageEmbed, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const BankAccount = require('../../Schemas.js/bankSchema');
const User = require('../../Schemas.js/userAccountCreation');
const Blacklist = require('../../Schemas.js/BlacklistSchema');

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: 'transfer',
  description: 'Transfer money to another account',
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    try {
      const senderBalance = await User.findOne({ userId: message.author.id });

      if (!senderBalance) {
        return message.reply('You do not have an account `ep start`.');
      }

      const receiverAccountNumber = args[0]; // Assuming account number is the first argument
      const transferAmount = Number(args[1]); // Assuming amount is the second argument

      if (!receiverAccountNumber || isNaN(transferAmount) || transferAmount <= 0 || transferAmount > senderBalance.balance) {
        return message.reply('Please provide a valid account number and amount.');
      };


      const receiverBankAccount = await BankAccount.findOne({ accountNumber: receiverAccountNumber });

      if (!receiverBankAccount) {
        return message.reply('These bank account does not exist.');
      }

      // Create an embed for the transfer confirmation
      const transferConfirmationEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Transfer Confirmation')
        .setDescription(`You are transferring **${transferAmount.toLocaleString()}** from your account to ${receiverBankAccount.accountName}'s account.`);

      // Create buttons for accept and decline
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('acceptTransfer')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('declineTransfer')
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger),
        );

      await message.reply({
        content: 'Please confirm the transfer:',
        embeds: [transferConfirmationEmbed],
        components: [row],
      });


      // Handle button interactions and transfer logic here
      const interactionFilter = (interaction) => interaction.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ interactionFilter, time: 15000 });

    collector.on('collect', async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId === 'acceptTransfer') {
          // Perform the transfer logic for acceptance
          // Deduct the amount from the sender's account and add it to the receiver's account

          // Example logic:
          senderBalance.balance -= transferAmount;
          receiverBankAccount.bankBalance += transferAmount;

          // Save changes to the database
          await senderBalance.save();
          await receiverBankAccount.save();

          await interaction.update({
            content: 'Transfer accepted!',
            components: [], // Remove the buttons after acceptance
          });

          collector.stop('transfer_accepted');
        } else if (interaction.customId === 'declineTransfer') {
          await interaction.update({
            content: 'Transfer declined.',
            components: [], // Remove the buttons after decline
          });

          collector.stop('transfer_declined');
        }
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await message.reply('Transfer confirmation timed out.');
      }
    });

    } catch (err) {
      console.error(err);
      return message.reply('An error occurred while processing your transfer.');
    }
  },
};
