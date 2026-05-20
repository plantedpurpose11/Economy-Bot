const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];

module.exports = {
  name: "give",
  description: "Give EP coins to another user",
  aliases: ["send"],
  usage: "give <mention> <amount>",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    // Command cooldown check
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. Please wait for 7 seconds!",
        ephemeral: true,
      });

    // Command cooldown setup
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);

    try {
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply(`${emojis.level} **First use** \`ep start\` **to start your journey.**`);
      }

      const mentionedUser = message.mentions.users.first();
      const amount = parseInt(args[1]);

      if (!mentionedUser || isNaN(amount) || amount <= 0) {
        return message.reply(
          "Please mention a user and provide a valid amount to give."
        );
      }

      if (mentionedUser.id === message.author.id) {
        return message.reply("You cannot give EP coins to yourself!");
      }

      const mentionedUserAccount = await User.findOne({
        userId: mentionedUser.id,
      });

      if (!mentionedUserAccount) {
        return message.reply(
          `${emojis.level} The user you want to give EP coins to does not have an account yet!`
        );
      }

      if (amount > user.balance) {
        return message.reply(
          "You don't have enough balance for this transaction!"
        );
      }

      // Confirmation Embed
      const confirmEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Confirm Transaction")
        .setDescription(
          `Are you sure you want to give **__${amount}__** ${emojis.currencyEmoji} EP coins to ${mentionedUser}?`
        );

      const confirmButton = new ButtonBuilder()
        .setCustomId("confirm_transaction")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success);

      const cancelButton = new ButtonBuilder()
        .setCustomId("cancel_transaction")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(
        confirmButton,
        cancelButton
      );

      const confirmMessage = await message.reply({
        embeds: [confirmEmbed],
        components: [row],
        ephemeral: true,
      });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = confirmMessage.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "confirm_transaction") {
          // Transfer coins
          user.balance -= amount;
          let transferredAmount = amount;
          const theftChance = Math.random();

          if (theftChance <= 0.3) {
            const theftAmount = Math.ceil(amount * 0.1); // 10% theft amount
            user.balance -= theftAmount;
            transferredAmount -= theftAmount;
        
            // Notify the user about the theft
            await interaction.reply({ content: `${emojis.detective} Oh no! **${theftAmount}** ${emojis.currencyEmoji} EP coins were stolen during the transaction! The remaining **${transferredAmount}** ${emojis.currencyEmoji} EP coins were successfully transferred to ${mentionedUser}.` });
          } else {
            await interaction.reply({ content: `${emojis.success} Transaction successful! **${transferredAmount}** ${emojis.currencyEmoji} EP coins transferred to ${mentionedUser}.` });
          }

          mentionedUserAccount.balance += transferredAmount;
          await user.save();
          await mentionedUserAccount.save();

          await confirmMessage.edit({ components: [] }).catch(console.error); // Remove the embed and buttons
        } else if (interaction.customId === "cancel_transaction") {
          await interaction.reply({ content: `${emojis.error} Transaction cancelled.` });
          await confirmMessage.edit({ components: [] }).catch(console.error); // Remove the embed and buttons
        }
        collector.stop();
      });

      collector.on("end", async () => {
        await confirmMessage.edit({ components: [] }).catch(console.error); // Remove the embed and buttons
      });
    } catch (err) {
      console.error("Error:", err);
      message.reply(`${emojis.maintenance} An error occurred while processing the transaction.`);
    }
  },
};
