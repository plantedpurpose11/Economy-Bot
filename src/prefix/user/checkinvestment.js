const { Lottery, UserLotteryEntry } = require("../../Schemas.js/lotterySchema");
const User = require("../../Schemas.js/userAccountCreation");
const { EmbedBuilder } = require("discord.js");

const Blacklist = require("../../Schemas.js/BlacklistSchema");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const timeout = [];

module.exports = {
  name: "investment",
  description: "Check the ongoing investment details",
  aliases: ['i'],

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    //command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. wait 7 seconds!",
        ephemeral: true,
      });

    //command cooldown

    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);

    try {
      // Check if the user has an account
      const user = await User.findOne({ userId: message.author.id });
      if (!user) {
        return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
      }

      const currentLottery = await Lottery.findOne({
        endTime: { $gt: Date.now() },
      });

      if (!currentLottery) {
        return message.reply("No ongoing investments at the moment.");
      }
      // Check if the user has entered the lottery
      const userEntry = await UserLotteryEntry.findOne({
        userId: message.author.id,
      });
      if (!userEntry) {
        return message.reply(
          "You haven't entered the investment yet. `ep addinvestment <amount>`."
        );
      }

      // Calculate remaining time in hours, minutes, and seconds
      const remainingTime = currentLottery.endTime - Date.now();
      const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
      const remainingMinutes = Math.floor(
        (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
      );
      const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

      const embed = new EmbedBuilder()
        .setTitle(`${user.userName} | Investment Details`)
        .addFields({
          name: "Ends In",
          value: `\`\`\`${remainingHours} hours, ${remainingMinutes} minutes, ${remainingSeconds} seconds\`\`\``,
        })
      
        .addFields({
          name: "Your Added Amount",
          value: `\`\`\`${userEntry.amountAdded}\`\`\``,
        })
        .addFields({
          name: "Your Shares",
          value: `\`\`\`${(userEntry.chancesOfWinning * 100).toFixed(
            2
          )}%\`\`\``,
        })
        .addFields({
          name: "Total Amount in the Investment",
          value: `\`\`\`${currentLottery.totalAmount}\`\`\``,
        })
        .setTimestamp()
        .setColor(0x00ff00);

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Error while checking investment:", err);
      return message.reply(
        "An error occurred while fetching investment details."
      );
    }
  },
};
