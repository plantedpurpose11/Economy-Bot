const {
  MessageActionRow,
  MessageButton,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageEmbed,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const Bank = require("../../Schemas.js/bankSchema");
const Blacklist = require("../../Schemas.js/BlacklistSchema");

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: "withdraw",
  description: "Withdraw coins from your bank account",
  aliases: ["wd"],
  usage: "withdraw",
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
      return message.reply("Your bank account is pending approval.");
    }

    // Simulating pin code verification

    // Create a button to trigger pin code input
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enter_pin")
        .setLabel("Enter Withdraw Details")
        .setStyle(ButtonStyle.Primary)
    );

    const withdrawEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setDescription(`Click the button to enter your withdraw details.`);

    await message.reply({ embeds: [withdrawEmbed], components: [row] });
  },
};
