const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const config = require("../../../config.json");
const emojis = require("../../../emojis.json");

module.exports = {
  name: "vote",
  description: "Vote for our bot!",
  usage: "vote",

  run: async (client, message) => {
    const { apiKey, botId, voteReward } = config.topgg;
    const userId = message.author.id;

    const user = await User.findOne({ userId: message.author.id });

    if (!user) {
      return message.reply("You don't have an account yet! `ep start`");
    }

    try {
      const response = await fetch(`https://top.gg/api/bots/${botId}/check?userId=${userId}`, {
        headers: {
          Authorization: apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.voted === 1) {
          return message.reply("**You've already voted!** Thank you for your support.");
        } else if (data.voted === 0) {
          const voteEmbed = new EmbedBuilder()
            .setTitle("Vote for Our Bot!")
            .setDescription(`Please vote for our bot to support us.\nYou will get ${voteReward.toLocaleString()} ${emojis.currencyEmoji} EP Coins.`)
            .setColor("#7289DA");

          return message.reply({
            embeds: [voteEmbed],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel("Vote Now")
                  .setStyle(ButtonStyle.Link)
                  .setURL(config.topggVoteLink)
              ),
            ],
          });
        }
      } else {
        return message.reply("**There was an error while checking your vote status. Try again in a few minutes.**");
      }
    } catch (error) {
      console.error("Error:", error);
      return message.reply("There was an error while processing the vote command.");
    }
  },
};
