const { MessageActionRow, MessageButton, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const Bank = require("../../Schemas.js/bankSchema"); // Assuming Bank schema/model is imported correctly
const Blacklist = require("../../Schemas.js/BlacklistSchema");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: "topcash",
  aliases: ["tc"],
  description: "Display top 10 members with the highest cash",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    const userAccount = await User.findOne({ userId: message.author.id });

    if (!userAccount) {
      return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
    }

    try {
      const guild = message.guild;
      const guildId = guild.id;

      // Fetch all users in the guild along with their bank balances
      const users = await User.find({ guildId });

      if (!users || users.length === 0) {
        return message.reply("No users found.");
      }

      // Fetch bank accounts for all users in the guild
      const bankAccounts = await Bank.find({ /* Add any conditions if needed */ });

      // Calculate combined balance for each user and sort users based on it
      users.sort((a, b) => {
        const aCombinedBalance = a.balance + (bankAccounts.find(bankUser => bankUser.userId === a.userId)?.bankBalance || 0);
        const bCombinedBalance = b.balance + (bankAccounts.find(bankUser => bankUser.userId === b.userId)?.bankBalance || 0);
        return bCombinedBalance - aCombinedBalance;
      });

      // Get the top 10 users
      const topUsers = users.slice(0, 10);

      // Find the user's rank in the top users
      const userRank = topUsers.findIndex(user => user.userId === message.author.id);

      const topEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Top 10 Members with Highest Combined Balance")
        .setDescription(
          topUsers.map((user, index) => {
            let position;
            let badge = "";

            switch (index) {
              case 0:
                position = "🥇 1st";
                break;
              case 1:
                position = "🥈 2nd";
                break;
              case 2:
                position = "🥉 3rd";
                break;
              default:
                position = `${index + 1}th`;
                badge = ":black_medium_square: ";
            }

            // Fetch bank balance for the user
            const bankUser = bankAccounts.find(bankUser => bankUser.userId === user.userId);
            const bankBalance = bankUser ? bankUser.bankBalance : 0;

            // Calculate combined balance by adding balance and bankBalance
            const combinedBalance = user.balance + bankBalance;
            const formattedCombinedBalance = combinedBalance.toLocaleString();

            return `${badge} ${position}. **${user.userName}** EP **__${formattedCombinedBalance}__**`;
          }).join("\n")
        );

      // If the user is in the top 10, display their rank
      if (userRank !== -1) {
        topEmbed.setDescription(
          `:calendar_spiral: Your Rank: **${userRank + 1}**\n\n` +
          topEmbed.data.description
        );
      } else {
        const user = users.find(u => u.userId === message.author.id);
        const userIndex = users.indexOf(user);
        topEmbed.setDescription(
          `Your Rank: ${userIndex + 1}\n\n` +
          topEmbed.data.description
        );
      }

      const sentMessage = await message.reply({
        embeds: [topEmbed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('top1')
              .setEmoji("🥇")
              .setLabel(topUsers[0]?.userName || "No User")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true),
            new ButtonBuilder()
            .setCustomId('top2')
              .setLabel(topUsers[1]?.userName || "No User")
              .setEmoji("🥈")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true),
            new ButtonBuilder()
            .setCustomId('top3')
              .setLabel(topUsers[2]?.userName || "No User")
              .setEmoji("🥉")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          ),
        ],
      });

      return sentMessage;
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while fetching top users.");
    }
  },
};
